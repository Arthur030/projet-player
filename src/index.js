import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const WidgetDivs = document.querySelectorAll('.player_widget')
WidgetDivs.forEach(Div => {
  ReactDOM.render(
    <React.StrictMode>
      <App domElement={Div}/>
    </React.StrictMode>,
    Div
  );

})

reportWebVitals();




