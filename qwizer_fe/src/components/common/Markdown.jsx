import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

const Markdown = ({ children }) => (
    <ReactMarkdown className='markdown'
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}>
        {children}
    </ReactMarkdown>
)

export default Markdown;