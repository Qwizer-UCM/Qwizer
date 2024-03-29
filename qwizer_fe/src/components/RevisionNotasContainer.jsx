import { useParams, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import VisualizarNota from './VisualizarNota';
import { Tests } from '../services/API';
import useFetch from '../hooks/useFetch';
import NotFound404 from './common/NotFound404';
import { PATH_REVISION_NOTAS_ALUMNO } from '../constants';

const CustomCell = ({ nota, id, idCuestionario }) => {
  const navigate = useNavigate();
  return (nota !== "No presentado" &&
    <button type="button" className="btn btn-primary" id={id} onClick={() => navigate(PATH_REVISION_NOTAS_ALUMNO(idCuestionario, id))}>
      Revisar
    </button>
  );
};

const ExpandedComponent = ({ data }) => <VisualizarNota data={data} />;

const paginationComponentOptions = {
  rowsPerPageText: 'Filas por página',
  rangeSeparatorText: 'de',
  selectAllRowsItem: true,
  selectAllRowsItemText: 'Todos',
};

const columns = [
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
        // TODO cambiar estilos por classNames https://react-data-table-component.netlify.app/?path=/docs/api-custom-conditional-formatting--page
        when: (row) => row.nota > (row.notaMaxima / 2) + 1,
        style: {
          backgroundColor: 'rgba(63, 195, 128, 0.9)',
          color: 'white',
        },
      },
      {
        when: (row) => row.nota >= row.notaMaxima / 2 && row.nota <= (row.notaMaxima / 2) + 1,
        style: {
          backgroundColor: 'rgba(248, 148, 6, 0.9)',
          color: 'white',
        },
      },
      {
        when: (row) => row.nota < row.notaMaxima / 2 || row.nota === 'No presentado',
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
  const { data: dataNotas, error, isLoading } = useFetch(Tests.getQuizGrades, {
    params: { idCuestionario: params.id },
    transform: ({ notas, notaMax }) =>
      Object.values(notas).map((nota) => ({
        id: nota.id,
        idCuestionario: params.id,
        nombre: nota.nombre,
        apellidos: nota.apellidos,
        nota: nota.nota,
        notaMaxima: notaMax
      })),
  });

  if (isLoading) return null;

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

  return <NotFound404 />
};

export default RevisionNotasContainer;
