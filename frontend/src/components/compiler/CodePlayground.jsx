import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { compilerService } from '../../services/compilerService';

export const CodePlayground = () => {
    const location = useLocation();
    const [runtimes, setRuntimes] = useState([]);
    const [selectedRuntime, setSelectedRuntime] = useState(null);
    const [code, setCode] = useState('// Select a language and start coding!');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [theme, setTheme] = useState('vs-dark');

    useEffect(() => {
        loadRuntimes();
    }, []);

    const loadRuntimes = async () => {
        const data = await compilerService.getRuntimes();
        setRuntimes(data);

        // Check for URL params
        const params = new URLSearchParams(location.search);
        const urlLanguage = params.get('language');
        const urlCode = params.get('code');

        let initialRuntime = null;

        if (urlLanguage) {
            const normalizedLang = urlLanguage.toLowerCase();

            // 1. Try exact match or alias match (from API)
            initialRuntime = data.find(r =>
                r.language === normalizedLang ||
                r.aliases.some(alias => alias === normalizedLang)
            );
        }

        if (!initialRuntime) {
            // Default to Python if available or first in list
            // But only if we really couldn't find a match.
            // If the user actively chose 'text' or something unsupported, maybe we should just default to the first one but show a toast?
            initialRuntime = data.find(r => r.language === 'python');
        }

        if (initialRuntime) {
            setSelectedRuntime(initialRuntime);

            if (urlCode) {
                setCode(decodeURIComponent(urlCode));
            } else if (!urlLanguage) {
                // Only set default code if no URL code provided AND no URL language provided (to avoid overwriting user intent if they just linked language)
                setCode('print("Hello from the Blog Platform Compiler!")');
            } else {
                // Update boilerplate if language selected via URL but no code
                updateCodeTemplate(initialRuntime.language);
            }
        } else if (data.length > 0) {
            setSelectedRuntime(data[0]);
        }
    };

    const updateCodeTemplate = (lang) => {
        switch (lang) {
            case 'python': setCode('print("Hello World")'); break;
            case 'javascript': setCode('console.log("Hello World");'); break;
            case 'typescript': setCode('console.log("Hello World");'); break;
            case 'java': setCode('public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}'); break;
            case 'c++': setCode('#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}'); break;
            case 'c': setCode('#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}'); break;
            case 'csharp': setCode('using System;\n\npublic class Program\n{\n    public static void Main()\n    {\n        Console.WriteLine("Hello World");\n    }\n}'); break;
            case 'go': setCode('package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}'); break;
            case 'rust': setCode('fn main() {\n    println!("Hello World");\n}'); break;
            case 'php': setCode('<?php\n\necho "Hello World";\n'); break;
            case 'ruby': setCode('puts "Hello World"'); break;
            case 'swift': setCode('print("Hello World")'); break;
            case 'kotlin': setCode('fun main() {\n    println("Hello World")\n}'); break;
            default: setCode('// Write your code here');
        }
    };

    const handleRun = async () => {
        if (!selectedRuntime) return;

        setIsRunning(true);
        setOutput('');
        try {
            const result = await compilerService.executeCode(
                selectedRuntime.language,
                selectedRuntime.version,
                code
            );

            if (result.run) {
                setOutput(result.run.output);
            } else {
                setOutput('Error executing code');
            }
        } catch (error) {
            toast.error('Failed to execute code');
            setOutput(error.message || 'Execution failed');
        } finally {
            setIsRunning(false);
        }
    };

    const handleLanguageChange = (e) => {
        const runtime = runtimes.find(r => r.language === e.target.value);
        setSelectedRuntime(runtime);
        // Update boilerplate code based on language
        if (runtime) {
            updateCodeTemplate(runtime.language);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-900 text-white">
            {/* Header */}
            <header className="h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-950">
                <div className="flex items-center gap-4">
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                        Code Playground
                    </span>
                    <select
                        value={selectedRuntime?.language || ''}
                        onChange={handleLanguageChange}
                        className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        {runtimes.map(r => (
                            <option key={`${r.language}-${r.version}`} value={r.language}>
                                {r.language.charAt(0).toUpperCase() + r.language.slice(1)} ({r.version})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Toggle Theme"
                    >
                        {theme === 'vs-dark' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        )}
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className={`px-6 py-2 rounded-full font-bold uppercase tracking-wider text-sm transition-all
                            ${isRunning
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-500 text-white hover:shadow-lg hover:shadow-green-500/20'
                            }`}
                    >
                        {isRunning ? 'Running...' : 'Run Code'}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor */}
                <div className="flex-1 relative">
                    <Editor
                        height="100%"
                        language={selectedRuntime?.language === 'c++' ? 'cpp' : selectedRuntime?.language}
                        value={code}
                        theme={theme}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            padding: { top: 20 },
                            scrollBeyondLastLine: false,
                        }}
                    />
                </div>

                {/* Output Panel */}
                <div className="w-1/3 border-l border-gray-800 bg-gray-950 flex flex-col">
                    <div className="px-4 py-2 border-b border-gray-800 font-semibold text-gray-400 text-sm">
                        Output
                    </div>
                    <div className="flex-1 p-4 font-mono text-sm overflow-auto whitespace-pre-wrap text-gray-300">
                        {output || <span className="text-gray-600 italic">Run your code to see output here...</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};
