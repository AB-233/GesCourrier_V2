import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';

const mockMails = [
  { id: 1, sujet: "Lettre de la mairie", date: "2024-06-30" },
  { id: 2, sujet: "Facture EDF", date: "2024-06-29" },
  { id: 3, sujet: "Convocation réunion", date: "2024-06-28" },
];

const IncomingMailList = () => {
  const [mails, setMails] = useState([]);

  useEffect(() => {
    // Simuler un chargement de données et tri par date décroissante
    const sortedMails = [...mockMails].sort((a, b) => new Date(b.date) - new Date(a.date));
    setMails(sortedMails);
  }, []);

  return (
    <>
      <Helmet>
        <title>Courriers Arrivés - GesCourrier</title>
        <meta name="description" content="Liste des courriers arrivés." />
      </Helmet>
      <div className="text-gray-900 dark:text-white">
        <h1 className="text-3xl font-bold mb-4">Courriers Arrivés</h1>
        <ul>
          {mails.map(mail => (
            <li key={mail.id} className="mb-2">
              <span className="font-semibold">{mail.sujet}</span> — <span className="text-sm">{mail.date}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default IncomingMailList;
