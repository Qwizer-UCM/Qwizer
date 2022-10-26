import { useParams, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import VisualizarNota from './VisualizarNota';
import { Tests } from '../services/API';
import useFetch from '../hooks/useFetch';

const CustomCell = ({ id, idCuestionario }) => {
  const navigate = useNavigate();
  return (
    <button type="button" className="btn btn-primary" id={id} onClick={() => navigate(`/revisionNotas/${idCuestionario}/${id}`)}>
      Revisar
    </button>
  );
};

const ExpandedComponent = ({ data }) => (
  <div>
    <VisualizarNota data={data} />
  </div>
);

const paginationComponentOptions = {
  rowsPerPageText: 'Filas por página',
  rangeSeparatorText: 'de',
  selectAllRowsItem: true,
  selectAllRowsItemText: 'Todos',
};

const columns = [
  {
    name: '#',
    selector: (row) => row.numero,
    sortable: true,
  },
  {
    name: 'id',
    selector: (row) => row.id,
    sortable: true,
    omit: true,
  },
  {
    name: 'idCuestionario',
    selector: (row) => row.idCuestionario,
    sortable: true,
    omit: true,
  },
  {
    name: 'Nombre',
    selector: (row) => row.nombre,
    sortable: true,
  },
  {
    name: 'Apellidos',
    selector: (row) => row.apellidos,
    sortable: true,
  },
  {
    name: 'Nota',
    selector: (row) => row.nota,
    conditionalCellStyles: [
      {
        when: (row) => row.nota > 6,
        style: {
          backgroundColor: 'rgba(63, 195, 128, 0.9)',
          color: 'white',
        },
      },
      {
        when: (row) => row.nota >= 5 && row.nota <= 6,
        style: {
          backgroundColor: 'rgba(248, 148, 6, 0.9)',
          color: 'white',
        },
      },
      {
        when: (row) => row.nota < 5 || row.nota === 'No presentado',
        style: {
          backgroundColor: '#963d46',
          color: 'white',
        },
      },
    ],
  },
  {
    cell: CustomCell,
    ignoreRowClick: true,
    allowOverflow: true,
  },
];

const RevisionNotasContainer = () => {
  const params = useParams();
  const { data: dataNotas, error } = useFetch(Tests.getQuizGrades, {
    params: { idCuestionario: params.id },
    transform: ({ notas }) =>
      notas.map((nota, indx) => ({
        numero: indx,
        id: nota.id,
        idCuestionario: params.id,
        nombre: nota.nombre,
        apellidos: nota.apellidos,
        nota: nota.nota,
      })),
  });

  if (dataNotas && !error) {
    return (
      <div className="index-body">
        <div className="card tabla-notas">
          <DataTable
            pointerOnHover
            theme="default"
            title={`Revisión de las notas del cuestionario ${params.id}`}
            columns={columns}
            expandableRows
            expandableRowsComponent={ExpandedComponent}
            data={dataNotas}
            pagination
            paginationComponentOptions={paginationComponentOptions}
          />
        </div>
      </div>
    );
  }

  return <div>LOADING</div>;
};

export default RevisionNotasContainer;
