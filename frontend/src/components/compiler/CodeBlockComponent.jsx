import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { CodeBlockHeader } from './CodeBlockHeader';
import { useEffect, useState } from 'react';

export const CodeBlockComponent = ({ node, updateAttributes, extension }) => {
    // Determine language, default to null or 'text'
    const language = node.attrs.language;

    // We can't easily get the *text content* of the node inside the React component 
    // reliably for the "Run" button without it being potentially stale or requiring an editor query.
    // However, for Tiptap NodeViews, the `node` prop has content.
    // Let's try to get content from `node.textContent`.
    // Note: node.textContent might be empty on initial render if it's a new block?

    // We'll use a local state to help force re-renders if needed, but usually `node` prop updates.
    // Actually, for the "Run" button to work in the editor, we need the current code.
    const code = node.textContent;

    return (
        <NodeViewWrapper className="code-block my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shadow-sm transition-all hover:shadow-md">
            {/* We'll use our shared header, but we might want to make the language selectable here */}
            <div className="relative group">
                <CodeBlockHeader language={language} code={code} />

                {/* Language Selector Overlay (only visible on hover/focus in editor) */}
                <select
                    contentEditable={false}
                    defaultValue={language}
                    onChange={(event) => updateAttributes({ language: event.target.value })}
                    className="absolute top-1 left-4 opacity-0 group-hover:opacity-100 cursor-pointer w-24 h-6 text-xs bg-transparent text-transparent focus:text-gray-900 dark:focus:text-gray-100 focus:opacity-100 focus:bg-white dark:focus:bg-gray-800 border border-gray-300 rounded"
                    title="Change Language"
                >
                    <option value="null">Auto</option>
                    <option value="python">Python</option>
                    <option value="javascript">JavaScript</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="sql">SQL</option>
                </select>
            </div>

            <pre className="p-4 bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto m-0">
                <NodeViewContent as="code" />
            </pre>
        </NodeViewWrapper>
    );
};
