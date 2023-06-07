import Countdown from 'react-countdown';

const CuentaAtras = ({ startTime, endTest, duration }) => {
  const updateTime = () => {
    const initTime = new Date(startTime);
    const actualTime = new Date();
    const passedMiliseconds = actualTime.getTime() - initTime.getTime();

    let leftMiliseconds = duration * 60 * 1000 - passedMiliseconds;
    if (leftMiliseconds <= 0) leftMiliseconds = 0;

    return leftMiliseconds;
  };

  const renderer = ({ hours, minutes, seconds, completed, total }) => {
    if (completed) {
      endTest();
      localStorage.removeItem('initTime');
      localStorage.removeItem('answers');
      return <h1>Test Enviado</h1>;
    }
    const totalms = duration * 60 * 1000; // milisegundos
    const porcentaje = 100 - Math.floor(((totalms === total ? (total) : total - 1000) / totalms) * 100);
    const bg = porcentaje >= 80 && 'bg-danger';

    return (
      <div>
        { seconds === 60 ?
          <p className="text-center">
            {hours}h:{minutes}min:{seconds - 1}s
          </p>
          :
          <p className="text-center">
            {hours}h:{minutes}min:{seconds}s
          </p>
        }
        <div className="progress">
          <div
            className={`progress-bar progress-bar-striped progress-bar-animated ${bg}`}
            role="progressbar"
            style={{ width: `${porcentaje}%`, transition: `width linear ${Math.max(Math.floor(totalms / 100), 1000)}ms` }}
            aria-valuenow={porcentaje}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    );
  };

  return <Countdown date={Date.now() + updateTime()} renderer={renderer} />;
};

export default CuentaAtras;
