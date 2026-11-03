
import React from 'react';

function ModulePage({ title, description }) {

  return (
    <div className="dashboard">

      <div className="dashboard-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <button className="add-button">
          + Add New
        </button>
      </div>

      <div className="panel module-welcome">

        <div className="module-icon">
          ▦
        </div>

        <h3>{title} Management</h3>

        <p>
          Welcome to the SmartBiz ERP {title} module.
        </p>

        <p>
          This module will help you manage your
          business operations efficiently.
        </p>

      </div>

    </div>
  );
}

export default ModulePage;
