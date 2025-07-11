import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PencilIcon, TrashIcon, PaperAirplaneIcon, PlayIcon, StopIcon, XCircleIcon, InformationCircleIcon, LinkIcon } from '@heroicons/react/24/solid';
import NSTSender from './NSTSender';
import { getExperiments, terminateExperiment, runExperiment, deleteExperiment } from '../services/snaService';
import Cookies from 'js-cookie';

function NSTList() {
  const [experiments, setExperiments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState([]);
  const [selectedNST, setSelectedNST] = useState(null);
  const [showTable, setShowTable] = useState(true);
  const sessionId =  Cookies.get("sessionId");

  // Obtener datos de la API (Deployed NSTs)
  useEffect(() => {
    const fetchNSTData = async () => {
      try {
        const experimentsData = await getExperiments(sessionId);
        const formattedExperiments = experimentsData.map((experiment) => ({
          id: experiment.id || '',
          experimentName: experiment.experimentName || `Experiment-${experiment.trialId}`,
          node: experiment.targetNode || '',
          applications: experiment.southNodeAdapterNetworkServiceTemplate?.applications || [],
          gpsis: experiment.southNodeAdapterNetworkServiceTemplate?.subscriptions || [],
          startDate: experiment.startTime || '',
          endDate: experiment.stopTime || '',
          status: experiment.southNodeAdapterNetworkServiceTemplate?.status || 'CREATED',
        }));
        setExperiments(formattedExperiments);
      } catch (error) {
        console.error('Error fetching NST data:', error);
      }
    };
    fetchNSTData();
  }, []);

  const handleInfo = (details, type) => {
    if (Array.isArray(details) && details.length > 0) {
      const formattedDetails = type === 'application'
        ? details.map((item) => ({
            appId: item.appName ? `${item.appName}-${item.appVersion}` : item.appId || 'N/A',
            tcSlice: item.tcSlice || 'N/A',
            resourceConsumption: item.resourceConsumption || 'N/A',
            flavourId: item.flavourId || 'N/A',
          }))
        : details.map((item) => ({
            gpsi: item.gpsi ? `${item.gpsi} - ${item.tcSlice}` : 'N/A',
          }));
      setModalContent(formattedDetails);
    } else {
      setModalContent([{ message: 'No details available.' }]);
    }
    setIsModalOpen(true);
  };
  

  const handleRun = async (experimentName) => {
    try {
      await runExperiment(sessionId, experimentName);
      alert('NST started successfully.');
    } catch (error) {
      console.error('Error running NST:', error);
      alert('Failed to start NST. Check the console for more details.');
    }
  };

  const handleDelete = async (experimentName) => {
    try {
      await deleteExperiment(sessionId, experimentName);
      setExperiments((prevExperiments) => prevExperiments.filter((exp) => exp.experimentName !== experimentName));
      alert('Experiment deleted successfully.');
    } catch (error) {
      console.error('Error deleting experiment:', error);
      alert('Failed to delete experiment.');
    }
  };

  const handleTerminate = async (experimentName) => {
    try {
      await terminateExperiment(sessionId, experimentName);
      alert('NST terminated successfully.');
    } catch (error) {
      console.error('Error terminating NST:', error);
      alert('Failed to terminate NST.');
    }
  };
  
  const handleOpenGrafana = (startDate, endDate) => {
    const parseToISO = (input) => {
      const [datePart, timePart, meridiem] = input.split(" ");
      const [day, month, year] = datePart.split("/");
      let [hour, minute] = timePart.split(":").map(Number);
  
      if (meridiem === "PM" && hour !== 12) hour += 12;
      if (meridiem === "AM" && hour === 12) hour = 0;
  
      const iso = new Date(`${year}-${month}-${day}T${String(hour).padStart(2, '0')}:${minute}:00Z`);
      return iso.toISOString();
    };
  
    const baseUrl = "https://grafana.sdwn.mwi.i2cat.net/d/eba26b3e-66bf-46bb-8b11-49ae6b1694f2/qosium";
  
    const startISO = parseToISO(startDate);
    const endISO = parseToISO(endDate);
  
    const url = `${baseUrl}?from=${startISO}&to=${endISO}`;
    console.log(`URL: ${url}`);
    window.open(url, "_blank");
  };
  


  const renderActions = (experiment) => (
    <div className="flex justify-center items-center space-x-4">
      {experiment.status === 'CREATED' && (
        <>
          <button className="text-green-500" title="Run Experiment" onClick={() => handleRun(experiment.experimentName)}>
            <PlayIcon className="h-6 w-6" />
          </button>
          <button className="text-blue-500" title="Delete Experiment" onClick={() => handleDelete(experiment.experimentName)}>
            <TrashIcon className="h-5 w-5" />
          </button>
        </>
      )}
      {experiment.status === 'LAUNCH_SUCCESS' && (
        <button className="text-yellow-500" title="Terminate Experiment" onClick={() => handleTerminate(experiment.experimentName)}>
          <StopIcon className="h-6 w-6" />
        </button>
      )}
      {experiment.status === 'LAUNCH_FAILED' && (
        <button className="text-blue-500" title="Delete Experiment" onClick={() => handleDelete(experiment.experimentName)}>
          <TrashIcon className="h-5 w-5" />
        </button>
      )}
      
      {experiment.status === 'TERMINATE_SUCCESS' && (
        <>
          <button className="text-green-500" title="Run Experiment" onClick={() => handleRun(experiment.experimentName)}>
            <PlayIcon className="h-6 w-6" />
          </button>
          <button className="text-blue-500" title="Delete Experiment" onClick={() => handleDelete(experiment.experimentName)}>
            <TrashIcon className="h-5 w-5" />
          </button>
          <button className="text-purple-500" title="Open Grafana" onClick={() => handleOpenGrafana(experiment.startDate, experiment.endDate)}>
            <LinkIcon className="h-5 w-5" />
          </button>
        </>
      )}

      {experiment.status === 'TERMINATE_FAILED' && (
        <>
        </>
      )}

    </div>
  );


  return (
    <div className="w-full">
      {showTable ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Experiments</h2>
          <table className="min-w-full table-auto bg-white mb-6">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Experiment Name</th>
                <th className="px-4 py-2">Node</th>
                <th className="px-4 py-2">Applications</th>
                <th className="px-4 py-2">GPSIs</th>
                <th className="px-4 py-2">Start Time</th>
                <th className="px-4 py-2">End Time</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((experiment, index) => (
                <tr key={experiment.experimentName} className="border-b text-center">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{experiment.experimentName}</td>
                  <td className="px-4 py-2">{experiment.node}</td>
                  <td className="px-4 py-2">
                  <button className="text-tertiary" onClick={() => handleInfo(experiment.applications, 'application')}>
                      <InformationCircleIcon className="h-6 w-6" />
                    </button>
                  </td>
                  <td className="px-4 py-2">
                  <button className="text-tertiary" onClick={() => handleInfo(experiment.gpsis, 'gpsi')}>
                      <InformationCircleIcon className="h-6 w-6" />
                    </button>
                  </td>
                  <td className="px-4 py-2">{experiment.startDate}</td>
                  <td className="px-4 py-2">{experiment.endDate}</td>
                  <td className="px-4 py-2">{experiment.status}</td>
                  <td className="px-4 py-2">{renderActions(experiment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 w-full">
                <Link to="/nst/create" className="btn w-full text-lg bg-tertiary hover:bg-secondary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                  Create new NST
                </Link>
          </div>
        </>
        ) : (
        <NSTSender nst={selectedNST} setShowTable={setShowTable} />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/3 relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 transition" onClick={() => setIsModalOpen(false)}>
              &#x2715;
            </button>
            <h2 className="text-2xl font-extrabold mb-4 text-gray-800 border-b-2 border-gray-300 pb-2">
              {modalContent[0]?.appId ? 'Application Details' : 'GPSI & Slice Details'}
            </h2>
            {modalContent.length > 0 ? (
              <ul className="space-y-2">
                {modalContent.map((item, index) => (
                  <li key={index} className="bg-tertiary text-white p-4 rounded-md shadow-sm hover:opacity-80 transition">
                    {item.gpsi && <div><strong>{item.gpsi}</strong></div>}
                    {item.appId && <div><strong>Application Name:</strong> {item.appId}</div>}
                    {item.tcSlice && <div><strong>Slice:</strong> {item.tcSlice}</div>}
                    {item.resourceConsumption && <div><strong>Resource:</strong> {item.resourceConsumption}</div>}
                    {item.flavourId && <div><strong>Flavour ID:</strong> {item.flavourId}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-700">No details available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NSTList;
