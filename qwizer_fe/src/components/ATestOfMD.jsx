import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css'

const MarkdownRender = () => {
  const [text, setText] = useState(`Tíldes no funcionan con mathjax\n$\\text{ávé}\\frac{3}{4}$\n![Image](/logo192.png)`);
  /*
    Con los $ se delimita el latex, ejemplo
    $\frac{3}{4}$

    El resto es markdown, para las imágenes se puede usar
    ![Nombre](ruta imagen)
    Seguramente debámos usar base64 para la imagen ya que no podemos cachear la ruta que viene back
    Habría que ver como controlar el tamaño de la imagen
*/
  return (
    <>
      <textarea cols="30" rows="10" value={text} onChange={(e) => setText(e.target.value)} />
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}>
        {text}
      </ReactMarkdown>
    </>
  );
};

export default MarkdownRender;
