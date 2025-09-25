import { useEffect, useRef, useCallback } from 'react';
import mermaid from 'mermaid';
import panzoom from 'panzoom';
import { ZoomControls } from './ZoomControls';
import { ZoomIndicator } from './ZoomIndicator';

// Inisialisasi Mermaid sekali saja
mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  securityLevel: 'loose', // Allow click events and callbacks
  fontFamily: 'sans-serif',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true
  },
  // Enable click events
  maxTextSize: 90000,
});

interface MermaidDiagramProps {
  chart: string; // Sintaks Mermaid, misal: 'graph LR; A-->B;'
  hoveredFile?: string | null; // Currently hovered file
}

export function MermaidDiagram({ chart, hoveredFile }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panzoomInstanceRef = useRef<any>(null);
  const isPointerInsideRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerEnter = () => {
      isPointerInsideRef.current = true;
    };

    const handlePointerLeave = () => {
      isPointerInsideRef.current = false;
    };

    container.addEventListener('pointerenter', handlePointerEnter);
    container.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      container.removeEventListener('pointerenter', handlePointerEnter);
      container.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current && chart) {
      mermaid.render('mermaid-svg', chart)
        .then(({ svg }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
            
            // Add debug logging
            console.log('Mermaid chart rendered:', chart);
            
            // Make sure the SVG is interactive and add manual click handlers
            const svgElement = containerRef.current.querySelector('svg');
            if (svgElement) {
              svgElement.style.pointerEvents = 'auto';
              
              // Initialize panzoom on the SVG element
              if (panzoomInstanceRef.current) {
                panzoomInstanceRef.current.dispose();
              }
              
              panzoomInstanceRef.current = panzoom(svgElement, {
                maxZoom: 10, // Increased from 3 to 10 for very detailed zoom
                minZoom: 0.1, // Decreased from 0.2 to 0.1 for wider view
                bounds: true,
                boundsPadding: 0.1,
                smoothScroll: false,
                zoomSpeed: 0.2, // Slower zoom for more precision
                // Disable panning when clicking on interactive elements
                filterKey: function() {
                  return true;
                }
              });
              
              // Add double-click to zoom to specific area
              svgElement.addEventListener('dblclick', (e) => {
                if (panzoomInstanceRef.current) {
                  e.preventDefault();
                  const rect = svgElement.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  
                  // Zoom in to the clicked point
                  const transform = panzoomInstanceRef.current.getTransform();
                  const newScale = Math.min(transform.scale * 2, 10);
                  panzoomInstanceRef.current.zoomTo(x, y, newScale);
                }
              });
              
              // Add click listeners to all clickable nodes manually
              const nodes = svgElement.querySelectorAll('g.node');
              console.log('Found nodes:', nodes.length);
              
              nodes.forEach((node, index) => {
                const htmlNode = node as HTMLElement;
                console.log(`Setting up node ${index}:`, node.id, node);
                htmlNode.style.cursor = 'pointer';
                htmlNode.style.pointerEvents = 'auto';
                
                // Extract file path from the chart data
                // We need to map node IDs back to file paths
                const nodeId = node.id || `node-${index}`;
                
                // Add click handler manually with panzoom consideration
                htmlNode.addEventListener('click', (e) => {
                  // Prevent panning when clicking on nodes
                  if (panzoomInstanceRef.current) {
                    e.stopPropagation();
                  }
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Node clicked:', nodeId, node);
                  
                  // Better text extraction with multiple strategies
                  const textElements = node.querySelectorAll('text, tspan');
                  let fileName = '';
                  
                  // Try different ways to extract filename
                  if (textElements.length > 0) {
                    for (const textEl of textElements) {
                      if (textEl.textContent && textEl.textContent.trim()) {
                        fileName = textEl.textContent.trim();
                        break;
                      }
                    }
                  }
                  
                  // If still no filename, try to extract from node ID
                  if (!fileName) {
                    // Extract from node ID: flowchart-index_js-0 -> index.js
                    const match = nodeId.match(/flowchart-(.+?)-\d+$/);
                    if (match) {
                      fileName = match[1].replace(/_/g, '.'); // index_js -> index.js
                    }
                  }
                  
                  console.log('Extracted filename:', fileName);
                  console.log('All text elements found:', Array.from(textElements).map(el => el.textContent));
                  
                  if (fileName && (window as any).handleMermaidNodeClick) {
                    console.log('Calling handleMermaidNodeClick with:', fileName);
                    (window as any).handleMermaidNodeClick(fileName);
                  } else {
                    console.warn('Could not extract filename from node:', node);
                  }
                });
              });
            }
          }
        })
        .catch(error => console.error("Mermaid render error:", error));
    }
  }, [chart]); // Render ulang hanya saat chart berubah

  // useEffect untuk hover highlighting
  useEffect(() => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector('svg');
    if (!svg) return;

    // Remove any existing hover class from all nodes
    svg.querySelectorAll('.mermaid-hover-highlight').forEach(el => {
      el.classList.remove('mermaid-hover-highlight');
    });

    if (hoveredFile) {
      console.log('🎯 Highlighting hovered file:', hoveredFile);
      
      // Cari node berdasarkan ID yang kita buat (dengan basename yang sudah di-escape)
      const getBasename = (filePath: string) => filePath.split('/').pop() || filePath;
      const nodeId = getBasename(hoveredFile).replace(/[^a-zA-Z0-9]/g, '_');
      
      console.log('🔍 Looking for node with ID:', nodeId);
      
      // Try multiple selector strategies
      const selectors = [
        `g#${nodeId}`,
        `g[id="${nodeId}"]`,
        `g.node[id*="${nodeId}"]`,
        `*[id*="${nodeId}"]`
      ];
      
      let nodeElement = null;
      for (const selector of selectors) {
        nodeElement = svg.querySelector(selector);
        if (nodeElement) {
          console.log('✅ Found node with selector:', selector, nodeElement);
          break;
        }
      }
      
      if (nodeElement) {
        console.log('🎨 Applying hover highlight to node:', nodeElement);
        
        // Method 1: Add CSS class for general styling
        nodeElement.classList.add('mermaid-hover-highlight');
        
        // Method 2: Direct attribute manipulation (more aggressive)
        const shapeElements = nodeElement.querySelectorAll('rect, polygon, path, circle, ellipse');
        const textElements = nodeElement.querySelectorAll('text, tspan');
        
        console.log('📋 Found elements:', {
          shapes: shapeElements.length,
          texts: textElements.length
        });
        
        // Apply styles by directly setting SVG attributes
        shapeElements.forEach((el, index) => {
          // Store original attributes for restoration
          if (!el.hasAttribute('data-original-stroke')) {
            el.setAttribute('data-original-stroke', el.getAttribute('stroke') || '');
            el.setAttribute('data-original-stroke-width', el.getAttribute('stroke-width') || '');
            el.setAttribute('data-original-fill', el.getAttribute('fill') || '');
          }
          
          // Set new attributes directly (this overrides everything)
          el.setAttribute('stroke', '#3b82f6');
          el.setAttribute('stroke-width', '3');
          el.setAttribute('fill', '#dbeafe');
          el.setAttribute('opacity', '1');
          
          // Also set inline styles as backup
          const htmlEl = el as HTMLElement;
          htmlEl.style.cssText = `
            stroke: #3b82f6 !important;
            stroke-width: 3px !important;
            fill: #dbeafe !important;
            filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8)) !important;
            transition: all 0.2s ease-in-out !important;
            opacity: 1 !important;
          `;
          
          console.log(`✨ Applied hover styles to shape ${index}:`, {
            element: el.tagName,
            attributes: {
              stroke: el.getAttribute('stroke'),
              fill: el.getAttribute('fill'),
              strokeWidth: el.getAttribute('stroke-width')
            },
            styles: htmlEl.style.cssText
          });
        });
        
        // Apply styles to text elements
        textElements.forEach((el, index) => {
          if (!el.hasAttribute('data-original-fill')) {
            el.setAttribute('data-original-fill', el.getAttribute('fill') || '');
          }
          
          el.setAttribute('fill', '#1e40af');
          el.setAttribute('font-weight', 'bold');
          
          const htmlEl = el as HTMLElement;
          htmlEl.style.cssText = `
            fill: #1e40af !important;
            font-weight: bold !important;
            opacity: 1 !important;
          `;
          
          console.log(`📝 Applied text styles to element ${index}:`, {
            element: el.tagName,
            fill: el.getAttribute('fill'),
            styles: htmlEl.style.cssText
          });
        });
        
        console.log(`✅ Applied hover highlight to ${shapeElements.length} shapes and ${textElements.length} texts`);
        
        // Force a repaint by temporarily changing a property
        const svgEl = svg as unknown as HTMLElement;
        const originalOpacity = svgEl.style.opacity;
        svgEl.style.opacity = '0.999';
        setTimeout(() => {
          svgEl.style.opacity = originalOpacity || '1';
        }, 0);
        
      } else {
        console.warn('❌ Could not find node for hover highlighting. Available nodes:');
        const allNodes = svg.querySelectorAll('g.node, g[id]');
        allNodes.forEach((node, i) => {
          console.log(`  Node ${i}:`, node.id, node.tagName, node);
        });
      }
    } else {
      // Restore original attributes when hover is cleared
      const highlightedElements = svg.querySelectorAll('[data-original-stroke], [data-original-fill]');
      highlightedElements.forEach(el => {
        // Restore shape attributes
        if (el.hasAttribute('data-original-stroke')) {
          const original = el.getAttribute('data-original-stroke');
          if (original) {
            el.setAttribute('stroke', original);
          } else {
            el.removeAttribute('stroke');
          }
          el.removeAttribute('data-original-stroke');
        }
        
        if (el.hasAttribute('data-original-stroke-width')) {
          const original = el.getAttribute('data-original-stroke-width');
          if (original) {
            el.setAttribute('stroke-width', original);
          } else {
            el.removeAttribute('stroke-width');
          }
          el.removeAttribute('data-original-stroke-width');
        }
        
        if (el.hasAttribute('data-original-fill')) {
          const original = el.getAttribute('data-original-fill');
          if (original) {
            el.setAttribute('fill', original);
          } else {
            el.removeAttribute('fill');
          }
          el.removeAttribute('data-original-fill');
        }
        
        // Clear inline styles
        (el as HTMLElement).style.cssText = '';
      });
    }
  }, [hoveredFile]); // Jalankan efek ini saat hover berubah

  // Cleanup effect for panzoom
  useEffect(() => {
    return () => {
      if (panzoomInstanceRef.current) {
        panzoomInstanceRef.current.dispose();
        panzoomInstanceRef.current = null;
      }
    };
  }, []);

  // Zoom control functions with custom increments
  const handleZoomIn = useCallback(() => {
    if (panzoomInstanceRef.current) {
      const transform = panzoomInstanceRef.current.getTransform();
      // Custom zoom increment for more precise control
      const newScale = Math.min(transform.scale * 1.3, 10);
      panzoomInstanceRef.current.zoomTo(transform.x, transform.y, newScale);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (panzoomInstanceRef.current) {
      const transform = panzoomInstanceRef.current.getTransform();
      // Custom zoom decrement for more precise control
      const newScale = Math.max(transform.scale / 1.3, 0.1);
      panzoomInstanceRef.current.zoomTo(transform.x, transform.y, newScale);
    }
  }, []);

  const handleResetView = useCallback(() => {
    if (panzoomInstanceRef.current) {
      panzoomInstanceRef.current.reset();
    }
  }, []);

  const handleFitToScreen = useCallback(() => {
    if (panzoomInstanceRef.current && containerRef.current) {
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        // Get the actual content bounds
        const bbox = svg.getBBox();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // Calculate the scale to fit the content with some padding
        const padding = 50;
        const scaleX = (containerRect.width - padding * 2) / bbox.width;
        const scaleY = (containerRect.height - padding * 2) / bbox.height;
        const scale = Math.min(scaleX, scaleY, 10); // Don't exceed maxZoom
        
        // Center the content
        const centerX = (containerRect.width - bbox.width * scale) / 2;
        const centerY = (containerRect.height - bbox.height * scale) / 2;
        
        panzoomInstanceRef.current.moveTo(centerX - bbox.x * scale, centerY - bbox.y * scale);
        panzoomInstanceRef.current.zoomAbs(0, 0, scale);
      }
    }
  }, []);

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when the mermaid container is focused or hovered
      const container = containerRef.current;
      if (!container) return;

      const activeElement = document.activeElement;
      const hasFocus = activeElement ? container.contains(activeElement) : false;
      const hasPointer = isPointerInsideRef.current;

      if (!hasPointer && !hasFocus) return;
      
      // Prevent shortcuts from interfering with text input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleResetView();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          handleFitToScreen();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleZoomIn, handleZoomOut, handleResetView, handleFitToScreen]);

  if (!chart) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
        Pilih sebuah file untuk melihat dependensinya.
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="mermaid-container w-full h-full p-4" />
      
      {/* Show zoom controls only when chart is rendered */}
      {chart && (
        <>
          <ZoomIndicator panzoomInstance={panzoomInstanceRef.current} />
          <ZoomControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleResetView}
            onFitToScreen={handleFitToScreen}
          />
        </>
      )}
    </div>
  );
}
