import React, { useState } from 'react'


 const LoginComponent = (props) => {
  const [currentUser, setUser] = useState({ user: "", pass: "" });

  return (
    <div className="main-container login-body">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-inputs">
          <h2 className="title">Qwizer</h2>
          <p></p>
          <br />
          <h5>Nombre de usuario</h5>
          <input className="form-control" id="username" placeholder="Nombre de usuario" onChange={(e) => setUser({ ...currentUser , user: e.target.value })}></input>
          <p></p>
          <h5>Contraseña</h5>
          <input type="password" className="form-control" id="password" placeholder="Contraseña" onChange={(e) => setUser({ ...currentUser , pass: e.target.value })}></input>
        </div>
        <p></p>
        <div className="buttons">
          <button className="btn btn-primary login-button" type="submit" onClick={() => props.login(currentUser.user, currentUser.pass)}>Login</button>
          <p></p>
          <a href='""'>¿Has olvidado la contraseña?</a>
        </div>
      </form>
    </div>
  );



}

export default LoginComponent;