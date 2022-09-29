import React, { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import DataTable from 'react-data-table-component';
import VisualizarNota from './VisualizarNota';
import { API_URL } from '../constants/Constants';

const paginationComponentOptions = {
  rowsPerPageText: 'Filas por página',
  rangeSeparatorText: 'de',
  selectAllRowsItem: true,
  selectAllRowsItemText: 'Todos',
};

const RevisionNotasContainer = (props) => {
  const [notasCuestionario,setNotasCuestionarios] = useState([])
  const [columns, setColumns] = useState(undefined)
  const [data,setData] = useState(undefined)
  const [title, setTitle] = useState(undefined)
  const params = useParams();
    
  useEffect(() => {
    getNotas();  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    generar_tabla()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notasCuestionario])

  const getNotas = () => {   
    let token = localStorage.getItem('token');
    const message = {idCuestionario: params.id};
    
    const jsonObject = JSON.stringify(message);
    fetch(`${API_URL}/get-quiz-grades`, {
    method: 'POST',
    headers:{
        'Content-type': 'application/json',
        'Authorization': token
    },
    body: jsonObject
    })
    .then(response => response.json())
    .then(data => {
      setNotasCuestionarios(data.notas)
    })
    .catch(error => console.log(error));
  }

  const generar_tabla = () => {
    
    let columns = [
      {
          name: '#',
          selector: row => row.numero,
          sortable: true
      },
      {
          name: 'id',
          selector: row => row.id,
          sortable: true,
          omit: true
      },{
        name: 'idCuestionario',
        selector: row => row.idCuestionario,
        sortable: true,
        omit: true
      },
      {
          name: 'Nombre',
          selector: row => row.nombre,
          sortable: true,
      },
      {
        name: 'Apellidos',
        selector: row => row.apellidos,
        sortable: true
      },
      {
        name: 'Nota',
        selector: row => row.nota,
        conditionalCellStyles: [
          {
            when: row => row.nota > 6,
            style: {
              backgroundColor: 'rgba(63, 195, 128, 0.9)',
              color: 'white',
            },
          },
          {
            when: row => row.nota >= 5 && row.nota <= 6,
            style: {
              backgroundColor: 'rgba(248, 148, 6, 0.9)',
              color: 'white',
            },
          },
          {
            when: row => row.nota < 5 || row.nota === "No presentado",
            style: {
              backgroundColor: '#963d46',
              color: 'white',
            },
          }
        ]
      },
      {
        cell:(row) => <button className='btn btn-primary' id={row.id} onClick={() => props.revisionTestProfesor(params.id, row.id)}>Revisar</button>,
        ignoreRowClick: true,
        allowOverflow: true,
      },
    ];
    
    let data = [];
    let idCuestionario = params.id;
    notasCuestionario.forEach((nota,indx) =>{
      let row = {
        numero : indx,
        id : nota.id,
        idCuestionario : idCuestionario, 
        nombre : nota.nombre,
        apellidos : nota.apellidos,
        nota : nota.nota,
      }
      data.push(row);
    });

    setColumns(columns)
    setData(data)
    setTitle("Revisión de las notas del cuestionario " + params.id)
  }

  const ExpandedComponent = ({ data }) =>{
    return <div>
      <VisualizarNota data={data}></VisualizarNota>
    </div>
  } 
 
    if(notasCuestionario && data){
      return(
            <div className='index-body'>
              <div className='card tabla-notas'>
                <DataTable
                  pointerOnHover
                  theme={"default"}	
                  title= {title}
                  columns={columns}
                  expandableRows
                  expandableRowsComponent={ExpandedComponent}
                  data={data}
                  pagination paginationComponentOptions={paginationComponentOptions}
                />
              </div>
            </div>
          );
        }
        else{
          return <div>LOADING</div>
        }

 
  

}

export default RevisionNotasContainer;