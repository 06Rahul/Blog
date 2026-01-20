import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'

// Import Extensions
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { CodeBlockComponent } from '../compiler/CodeBlockComponent'

// Configure lowlight
const lowlight = createLowlight(common)

const ToolbarButton = ({ onClick, isActive, disabled, children, title }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`p-2 rounded-lg transition-colors duration-200 
            ${isActive
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
            } 
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
    >
        {children}
    </button>
)

const Divider = () => <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 self-center" />

const MenuBar = ({ editor }) => {
    if (!editor) return null

    const addImage = () => {
        const url = window.prompt('URL')
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
        }
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href
        const url = window.prompt('URL', previousUrl)

        // cancelled
        if (url === null) {
            return
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        // update
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }

    return (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-20">
            {/* History */}
            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                title="Undo"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                title="Redo"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" /></svg>
            </ToolbarButton>

            <Divider />

            {/* Text Style */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 100-8H6v8zm0 0h8a4 4 0 110 8H6v-8z" /></svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Underline"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title="Strikethrough"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 15L3 9m0 0l6-6M9 9h10.5a2.5 2.5 0 010 5H9z" /></svg>
            </ToolbarButton>

            <Divider />

            {/* Headings */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="H1"
            >
                <span className="font-bold text-sm">H1</span>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="H2"
            >
                <span className="font-bold text-sm">H2</span>
            </ToolbarButton>

            <Divider />

            {/* Lists */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Ordered List"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h13M7 8h13M7 14h13M3 21h.01M3 8h.01M3 14h.01" /></svg>
            </ToolbarButton>

            <Divider />

            {/* Alignment */}
            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
                title="Align Left"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
                title="Align Center"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
                title="Align Right"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M13 18h7" /></svg>
            </ToolbarButton>

            <Divider />

            {/* Media */}
            <ToolbarButton
                onClick={setLink}
                isActive={editor.isActive('link')}
                title="Add Link"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={addImage}
                title="Add Image"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </ToolbarButton>

            <Divider />

            {/* Blocks */}
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Blockquote"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive('codeBlock')}
                title="Code Block"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            </ToolbarButton>

        </div>
    )
}

const TiptapEditorInner = ({ provider, ydoc, content, onChange, status, user, isCollaborative }) => {
    const extensions = useMemo(() => {
        const exts = [
            StarterKit.configure({
                history: !isCollaborative, // Enable history if not collaborative
                codeBlock: false, // Disable default code block
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }).extend({
                addNodeView() {
                    return ReactNodeViewRenderer(CodeBlockComponent)
                }
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Image,
            Link.configure({
                openOnClick: false,
            }),
            Placeholder.configure({
                placeholder: 'Start writing your story...',
            }),
        ]

        if (isCollaborative) {
            exts.push(
                Collaboration.configure({
                    document: ydoc,
                }),
            )
        }
        return exts
    }, [isCollaborative, ydoc])

    const editor = useEditor({
        extensions,
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg dark:prose-invert px-8 py-8 focus:outline-none min-h-[500px] max-w-none',
            },
        },
    })

    // Sync content updates from parent (e.g. AI changes)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    if (!editor) {
        return null
    }

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm relative transition-colors duration-300">
            {/* Collaboration Status Indicator - Only show if collaborative */}
            {isCollaborative && (
                <div className={`absolute top-2 right-2 flex items-center gap-2 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    } z-10`}>
                    <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    {status === 'connected' ? 'Live' : 'Connecting...'}
                </div>
            )}

            <MenuBar editor={editor} />

            <div className="bg-white dark:bg-gray-800 min-h-[500px]">
                <EditorContent editor={editor} />
            </div>

            {/* Footer / Word Count */}
            <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400 dark:text-gray-500 font-serif italic">
                <span>{editor.storage.characterCount?.words?.() || 0} words</span>
                <span>Markdown supported</span>
            </div>
        </div>
    )
}

export const TiptapEditor = ({ content, onChange, blogId, isCollaborative = true }) => {
    const { user } = useAuth()
    const [status, setStatus] = useState('connecting')
    const [provider, setProvider] = useState(null)

    // Set up Yjs document and WebSocket provider
    const [ydoc] = useState(() => new Y.Doc())

    useEffect(() => {
        if (!isCollaborative) return;

        // Connect to the separate collaboration server
        const newProvider = new WebsocketProvider('ws://localhost:1234', `blog-${blogId || 'new'}`, ydoc)

        newProvider.on('status', event => {
            setStatus(event.status)
        })

        setProvider(newProvider)

        return () => {
            newProvider.destroy()
        }
    }, [blogId, ydoc, isCollaborative])

    if (isCollaborative && !provider) {
        return <div className="p-4 text-gray-400 italic">Initializing editor connection...</div>
    }

    return (
        <TiptapEditorInner
            provider={provider}
            ydoc={ydoc}
            content={content}
            onChange={onChange}
            status={status}
            user={user}
            isCollaborative={isCollaborative}
        />
    )
}
