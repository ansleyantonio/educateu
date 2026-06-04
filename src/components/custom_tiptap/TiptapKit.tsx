/* eslint-disable @typescript-eslint/no-explicit-any */
// TiptapKit.tsx - Extension for variable suggestions
import { Extension } from '@tiptap/core';
import { PluginKey } from '@tiptap/pm/state';
import Suggestion from '@tiptap/suggestion';

interface VariableOptions {
  allVariables: {
    '@': Array<{ label: string; value: string }>;
    '#': Array<{ label: string; value: string }>;
  };
}

// Helper function to get absolute position of cursor
const getCursorCoordinates = (view: any) => {
  const { state } = view;
  const { from } = state.selection;
  const start = view.coordsAtPos(from);
  
  return {
    left: start.left,
    top: start.top,
    bottom: start.bottom,
  };
};

// Helper function to update popup with proper positioning
const updatePopup = (props: any, popup: HTMLElement, selectedIndex: number) => {
  if (!popup) return;

  const { items, editor } = props;

  if (!items || items.length === 0) {
    popup.style.display = 'none';
    return;
  }

  popup.style.display = 'block';
  popup.innerHTML = '';

  items.forEach((item: any, index: number) => {
    const div = document.createElement('div');
    div.className = `item ${index === selectedIndex ? 'is-selected' : ''}`;
    div.textContent = item.label;
    
    div.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      props.command({ id: item.value, label: item.label });
    });

    popup.appendChild(div);
  });

  // Position the popup relative to cursor
  if (editor && editor.view) {
    try {
      const coords = getCursorCoordinates(editor.view);
      const editorRect = editor.view.dom.getBoundingClientRect();
      
      // Calculate position relative to viewport
      popup.style.left = `${coords.left}px`;
      popup.style.top = `${coords.bottom + 8}px`;
      
      // Ensure dropdown is visible on next frame (after dimensions are calculated)
      requestAnimationFrame(() => {
        const dropdownRect = popup.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Adjust horizontal position if goes off screen
        if (dropdownRect.right > viewportWidth - 10) {
          popup.style.left = `${viewportWidth - dropdownRect.width - 10}px`;
        }
        if (dropdownRect.left < 10) {
          popup.style.left = '10px';
        }
        
        // Adjust vertical position if goes off screen (show above cursor)
        if (dropdownRect.bottom > viewportHeight - 10) {
          popup.style.top = `${coords.top - dropdownRect.height - 8}px`;
        }
      });
    } catch (error) {
      console.error('Error positioning dropdown:', error);
    }
  }
};

// Create suggestion renderer
const createSuggestionRenderer = () => {
  let component: any;
  let popup: HTMLElement | null = null;
  let selectedIndex = 0;

  return {
    onStart: (props: any) => {
      component = props;
      selectedIndex = 0;

      // Create popup element
      popup = document.createElement('div');
      popup.className = 'variable-suggestion-dropdown';
      
      // Always append to body for consistent positioning
      document.body.appendChild(popup);
      
      // Position and render on next frame
      requestAnimationFrame(() => {
        if (popup && component) {
          updatePopup(component, popup, selectedIndex);
        }
      });
    },

    onUpdate: (props: any) => {
      component = props;
      
      // Maintain selection within bounds
      if (selectedIndex >= props.items.length) {
        selectedIndex = Math.max(0, props.items.length - 1);
      }
      
      if (popup) {
        updatePopup(props, popup, selectedIndex);
      }
    },

    onKeyDown: (props: any) => {
      // If items or popup are not ready, exit early
      if (!props || !Array.isArray(props.items) || props.items.length === 0) {
        return false;
      }

      const items = props.items;

      if (props.event.key === 'ArrowUp') {
        props.event.preventDefault();
        selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
        if (popup && component) updatePopup(component, popup, selectedIndex);
        return true;
      }

      if (props.event.key === 'ArrowDown') {
        props.event.preventDefault();
        selectedIndex = selectedIndex >= items.length - 1 ? 0 : selectedIndex + 1;
        if (popup && component) updatePopup(component, popup, selectedIndex);
        return true;
      }

      if (props.event.key === 'Enter' || props.event.key === 'Tab') {
        props.event.preventDefault();
        const item = items[selectedIndex];
        if (item) props.command({ id: item.value, label: item.label });
        return true;
      }

      if (props.event.key === 'Escape') {
        props.event.preventDefault();
        return true;
      }

      return false;
    },

    onExit: () => {
      if (popup) {
        popup.remove();
        popup = null;
      }
      component = null;
      selectedIndex = 0;
    },
  };
};

export const TiptapKit = Extension.create<VariableOptions>({
  name: 'variableSuggestion',

  addOptions() {
    return {
      allVariables: {
        '@': [],
        '#': [],
      },
    };
  },

  addProseMirrorPlugins() {
    const plugins = [];

    // Only add @ suggestion if variables are available
    if (this.options.allVariables['@'] && this.options.allVariables['@'].length > 0) {
      plugins.push(
        Suggestion({
          editor: this.editor,
          char: '@',
          pluginKey: new PluginKey('variableSuggestion@'),
          
          items: ({ query }) => {
            const variables = this.options.allVariables['@'] || [];
            
            // If no query, return first 10 items
            if (!query || query.trim() === '') {
              return variables.slice(0, 10);
            }
            
            // Filter based on query and return up to 10 results
            return variables
              .filter((item) =>
                item.label.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 10);
          },

          render: createSuggestionRenderer,

          command: ({ editor, range, props }: any) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent([
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'textStyle',
                      attrs: {
                        class: 'variable-node',
                      },
                    },
                  ],
                  text: props.id,
                },
                {
                  type: 'text',
                  text: ' ',
                },
              ])
              .run();
          },

          allow: ({ state, range }) => {
            const $from = state.doc.resolve(range.from);
            const allow = !!$from.parent.type.name.match(/^(paragraph|heading)$/);
            return allow;
          },
        })
      );
    }

    // Only add # suggestion if variables are available
    if (this.options.allVariables['#'] && this.options.allVariables['#'].length > 0) {
      plugins.push(
        Suggestion({
          editor: this.editor,
          char: '#',
          pluginKey: new PluginKey('variableSuggestion#'),
          
          items: ({ query }) => {
            const variables = this.options.allVariables['#'] || [];
            
            // If no query, return first 10 items
            if (!query || query.trim() === '') {
              return variables.slice(0, 10);
            }
            
            // Filter based on query and return up to 10 results
            return variables
              .filter((item) =>
                item.label.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 10);
          },

          render: createSuggestionRenderer,

          command: ({ editor, range, props }: any) => {
            editor
              .chain()
              .focus()
              .deleteRange(range)
              .insertContent([
                {
                  type: 'text',
                  marks: [
                    {
                      type: 'textStyle',
                      attrs: {
                        class: 'variable-node',
                      },
                    },
                  ],
                  text: props.id,
                },
                {
                  type: 'text',
                  text: ' ',
                },
              ])
              .run();
          },

          allow: ({ state, range }) => {
            const $from = state.doc.resolve(range.from);
            const allow = !!$from.parent.type.name.match(/^(paragraph|heading)$/);
            return allow;
          },
        })
      );
    }

    return plugins;
  },
});