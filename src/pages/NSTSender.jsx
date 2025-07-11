import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createExperiment } from '../services/snaService';
import Cookies from 'js-cookie';

function NSTSender({ nst, setShowTable }) {
  const [isLoading, setIsLoading] = useState(false);
  const sessionId =  Cookies.get("sessionId");

  const handleBack = () => {
    setShowTable(true);
  };

  const renderJSON = (data) => {
    return (
      <pre className="bg-gray-100 p-2 text-sm rounded border border-gray-300">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  const sendNSTToAPI = async () => {
    if (!nst) return;

    setIsLoading(true);
    try {
      const response = await createExperiment(sessionId, nst);

      if (!response) {
        throw new Error('Failed to send NST');
      }

      toast.success('NST sent successfully!', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setTimeout(() => {
        setShowTable(true);
      }, 3000);
    } catch (error) {
      console.error('Error sending NST:', error);
      toast.error('Failed to send NST. Check the console for more details.', {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="border rounded p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-center">NST JSON</h2>
        {nst ? renderJSON(nst) : <p>No NST selected.</p>}
      </div>

      <div className="flex justify-center space-x-4 mt-4">
        <button
          onClick={sendNSTToAPI}
          className="bg-tertiary text-white font-bold py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send NST to API'}
        </button>
        <button
          onClick={handleBack}
          className="bg-tertiary text-white font-bold py-2 px-4 rounded"
        >
          Back to List
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default NSTSender;
