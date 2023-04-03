import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import 'katex/dist/katex.min.css'
import { Questions} from '../services/API';

const MarkdownRender = () => {
  const [text, setText] = useState(`Tíldes no funcionan con mathjax\n$\\text{ávé}\\frac{3}{4}$\n![Image](logo192.png)`);

  const [files, setFiles] = useState([])
  /*
    Con los $ se delimita el latex, ejemplo
    $\frac{3}{4}$
  
    El resto es markdown, para las imágenes se puede usar
    ![Nombre](ruta imagen)
    Seguramente debámos usar base64 para la imagen ya que no podemos cachear la ruta que viene back
    Habría que ver como controlar el tamaño de la imagen
  */
  
  const buscarImagenes = (texto) => {
    const regex = /!\[(.*?)\]\(([\w\/\-\:\._]+?)\)/gi
    const n = texto.match(regex)
    console.log(n)
  }
  
  const probarImagen = (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file)
    })
    Questions.testpruebaImagen({formData}).then(({data}) => {
      let textFiles = ''
      for (const photo in data) {
        textFiles += `\n ![Image](${data[photo]})` 
        setText(`${text} ${textFiles}`)
      }
    })
  }
  
  
  return (
  <>
    <textarea className='p-2' cols="60" rows="10" value={text} onChange={(e) => {
      setText(e.target.value)
      buscarImagenes(e.target.value)
      }} />
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}>
      {text}
    </ReactMarkdown>
  
  
      <input type="file" onChange={(e) => setFiles([...e.target.files])} id="myfile" name="myfile" multiple />
      <div className="upload-message-section">
        {files !== '' && (
          <button type="submit" className="btn btn-success btn-submit" onClick={probarImagen}>
            Subir Imagen
          </button>
        )}
      </div>
  
  
  </>
  
  );
  };

export default MarkdownRender;


