import { CodeBlockHeader } from './CodeBlockHeader';

export const ExecutableCodeBlock = ({ language, code }) => {
    return (
        <div className="my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 group shadow-sm hover:shadow-md transition-all">
            <CodeBlockHeader language={language} code={code} />

            {/* Code Content */}
            <div className="p-4 bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto relative">
                <pre style={{ margin: 0 }}>{code}</pre>
            </div>
        </div>
    );
};
