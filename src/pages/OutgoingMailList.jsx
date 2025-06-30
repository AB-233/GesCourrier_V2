
import React from 'react';
import { Helmet } from 'react-helmet';

const OutgoingMailList = () => {
  return (
    <>
      <Helmet>
        <title>Courriers Départs - GesCourrier</title>
        <meta name="description" content="Liste des courriers départs." />
      </Helmet>
      <div className="text-gray-900 dark:text-white">
        <h1 className="text-3xl font-bold mb-4">Courriers Départs</h1>
        <p>Cette page affichera la liste des courriers départs.</p>
      </div>
    </>
  );
};

export default OutgoingMailList;
  