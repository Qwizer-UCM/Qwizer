import React from 'react'


//FIXME CHANGE TO FUNCTION
export default class EditTextQuestion extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        nombre:"",
        textValue: ""
      };
      this.actualizarPregunta = this.actualizarPregunta.bind(this);
    }

    componentDidMount(){
       this.setState({
           titulo: this.props.pregunta.title,
           nombre:this.props.pregunta.question,
           textValue:this.props.pregunta.correct_op,
        })
    }

    

    actualizarPregunta(){
        var question = this.props.pregunta
        question["title"] = this.state.titulo
        question["question"] = this.state.nombre
        question["correct_op"] = this.state.textValue
        this.props.updateEditQuestion(question);
    }

    render () {
        return(
            <div class="p-4 m-2 text-center">
                <label className='col-4'>Título: &nbsp;</label>
                <input className="col-8 m-input" name="titulo" type="text" value={this.state.titulo} onChange={(e) => this.setState({titulo:e.target.value})}/>

                <label className='col-4'>Pregunta: &nbsp;</label>
                <input className="col-8 m-input" name="nombre" type="text" value={this.state.nombre} onChange={(e) => this.setState({nombre:e.target.value})}/>
                
                <label className='col-4 align-top'>Respuesta: &nbsp;</label>
                <textarea className="col-8 m-input" rows="5" cols="50" name="textValue" onChange={(e) =>  this.setState({textValue: e.target.value})} value={this.state.textValue} />
                    
                <button class="btn btn-success" onClick={() => this.actualizarPregunta()}> Actualizar </button>
            </div>
        );
    }
}  