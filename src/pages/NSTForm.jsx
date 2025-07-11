import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGpsis, getApplications, getSlices, createExperiment } from '../services/snaService';
import { getTrialIds } from '../services/uwpService';
import { PlusCircleIcon, MinusCircleIcon } from '@heroicons/react/24/solid';
import Cookies from 'js-cookie';

function NSTForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sessionId =  Cookies.get("sessionId");
  
  const [nst, setNst] = useState({
    trialId: '',
    experimentName: '',
    startTime: '',
    stopTime: '',
    targetNode: 'SOUTH',
    targetFacility: 'UNUSED',
    northNodeAdapterNetworkServiceTemplate: {},
    southNodeAdapterNetworkServiceTemplate: {
      applications: [{ appId: '', appVersion: '', tcSlice: '', flavourId: '', resourceConsumption: '' }],
      subscriptions: [{ tcSlice: '', gpsi: '' }],
      status: 'CREATED',
    },
  });

  const [trialOptions, setTrialOptions] = useState([]);
  const [flavourIdOptions, setflavourIdOptions] = useState([]);

  const [gpsiOptions, setGpsiOptions] = useState([]);
  const [applicationOptions, setApplicationOptions] = useState([]);
  const [sliceApplicationOptions, setSliceApplicationOptions] = useState([]);
  const [sliceGpsiOptions, setSliceGpsiOptions] = useState([]);
  const [formValid, setFormValid] = useState(false);
 
  const resourceConsumptionOptions = ['RESERVED_RES_SHALL', 'RESERVED_RES_PREFER', 'RESERVED_RES_AVOID', 'RESERVED_RES_FORBID'];

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, '0') : '12';

    console.log(`Formated time: ${day}/${month}/${year} ${hours}:${minutes} ${ampm}`)
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };


  useEffect(() => {
     
    // Obtener opciones desde la API
    const fetchOptions = async () => {
      try {
        // Obtener GPSIs
        const gpsis = await getGpsis(sessionId);
        setGpsiOptions(gpsis);
  
        // Obtener aplicaciones
        const applications = await getApplications(sessionId);
        const appOptions = applications.map((app) => ({
          appId: app.appId,
          appName: app.appMetaData.appName,
          version: app.appMetaData.version,
          supportedFlavours: app.appDeploymentTcSlices[0]?.supportedFlavours || [],
        }));
        setApplicationOptions(appOptions);
  
        // Obtener slices
        const slices = await getSlices(sessionId);
        setSliceApplicationOptions(slices);
        setSliceGpsiOptions(slices);
  
        // Solo obtener trialId, startTime y stopTime si no se está editando
        if (!id) {
          const trialId = localStorage.getItem("trialId");
          console.log(`trialID en localstorage: ${JSON.stringify(trialId)}`)

          const trial = await getTrialIds(trialId);
          console.log(`Datos de trials: ${JSON.stringify(trial)}`)		  
          setNst((prevNst) => ({
            ...prevNst,
            trialId: trial.trial_id || '',
            experimentName: prevNst.experimentName && prevNst.experimentName !== `Experiment-${prevNst.trialId}`
            ? prevNst.experimentName
            : `Experiment-${trial.trial_id}`,
            startTime: trial.start_date ? formatDate(new Date(trial.start_date)) : '',
            stopTime: trial.end_date ? formatDate(new Date(trial.end_date)) : '',
          }));
        }
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };
  
    fetchOptions();
  }, [id]);
  



  useEffect(() => {
    const validateForm = () => {
      const { experimentName, southNodeAdapterNetworkServiceTemplate } = nst;
      const isValid =
        experimentName.trim() !== '' &&
        southNodeAdapterNetworkServiceTemplate.applications.every(({ appId, tcSlice }) => appId && tcSlice) &&
        southNodeAdapterNetworkServiceTemplate.subscriptions.every(({ gpsi, tcSlice }) => gpsi && tcSlice);
      setFormValid(isValid);
    };
    validateForm();
  }, [nst]);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formValid) {
        alert('Please fill in all required fields.');
        return;
      }
      try {
        await createExperiment(sessionId, { ...nst, experimentName: nst.experimentName.trim() || 'Default Experiment' });
        alert('NST created successfully!');
        navigate('/nst');
      } catch (error) {
        console.error('Error creating NST:', error);
        alert('Failed to create NST. Check the console for more details.');
      }
    };

  // Manejar cambios en los campos
  const handleChange = (e, index, field, nestedField) => {
    const { name, value } = e.target;
  
    // Si se está cambiando experimentName, actualizar directamente en nst
    if (name === 'experimentName') {
      setNst((prevNst) => ({
        ...prevNst,
        experimentName: value,
      }));
      return;
    }
  
    // Si field o nestedField no están definidos, evitar errores
    if (!field || !nestedField) return;
  
    // Manejar cambios en los campos anidados
    const newItems = [...nst[field][nestedField]];
    newItems[index][name] = value;
  
    if (name === 'appId') {
      // Actualizar appName, appVersion y opciones de flavourId
      const selectedApp = applicationOptions.find((app) => app.appId === value);
      if (selectedApp) {
        newItems[index]['appName'] = selectedApp.appName;
        newItems[index]['appVersion'] = selectedApp.version;
        newItems[index]['flavourIdOptions'] = selectedApp.supportedFlavours;
      }
    }
  
    setNst((prevNst) => ({
      ...prevNst,
      [field]: { ...prevNst[field], [nestedField]: newItems },
    }));
  };
  

  const addSlice = (field, nestedField) => {
    if (nst[field][nestedField].length < 8) {
      setNst((prevState) => ({
        ...prevState,
        [field]: {
          ...prevState[field],
          [nestedField]: [...prevState[field][nestedField], { appId: '', tcSlice: '', resourceConsumption: '', flavourId: '' }],
        },
      }));
    }
  };

  const removeSlice = (index, field, nestedField) => {
    if (nst[field][nestedField].length > 1) {
      const newItems = nst[field][nestedField].filter((_, idx) => idx !== index);
      setNst({ ...nst, [field]: { ...nst[field], [nestedField]: newItems } });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-lg border border-gray-200 shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">{id ? 'Edit NST' : 'Create NST'}</h2>
      <p className="text-gray-500 text-center mb-6">Fill in the details to create a new NST.</p>
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="experimentName">
              Experiment Name
            </label>
            <input
              id="experimentName"
              name="experimentName"
              type="text"
              value={nst.experimentName}
              onChange={handleChange}
              className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 focus:ring focus:ring-indigo-200"
              placeholder="Enter Experiment Name"
              required
            />
          </div>

          <div className="w-1/2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="trialId">
              Trial ID
            </label>
            <input
              id="trialId"
              name="trialId"
              type="text"
              value={nst.trialId || ''}
              readOnly
              className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 focus:ring focus:ring-indigo-200"
              disabled
            />
          </div>
        </div>

        <div className="flex space-x-4 mb-4">
          <div className="w-1/2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startTime">
              Start Time
            </label>
            <input
              id="startTime"
              name="startTime"
              type="text"
              value={nst.startTime || ''}
              readOnly
              className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 focus:ring focus:ring-indigo-200"
              disabled
            />
          </div>

          <div className="w-1/2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stopTime">
              Stop Time
            </label>
            <input
              id="stopTime"
              name="stopTime"
              type="text"
              value={nst.stopTime || ''}
              readOnly
              className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 focus:ring focus:ring-indigo-200"
              disabled
            />
          </div>
        </div>

        <div className="divider mt-12"><b>Select Application & Slice</b></div>

        <ul className="list-decimal pl-6">
          {nst.southNodeAdapterNetworkServiceTemplate.applications.map((item, index) => (
            <li key={index} className="mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-4 w-full">
                  {/* Application Selector */}
                  <div className="flex-1">
                    <select
                      id={`appId-${index}`}
                      name="appId"
                      value={item.appId}
                      onChange={(e) => handleChange(e, index, 'southNodeAdapterNetworkServiceTemplate', 'applications')}
                      className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 focus:ring focus:ring-indigo-200"
                    >
                      <option value="" disabled>Select application</option>
                      {applicationOptions.map((option, idx) => (
                        <option key={idx} value={option.appId}>
                          {option.appName} - {option.version}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Slice Selector */}
                  <div className="flex-1">
                    <select
                      id={`tcSlice-${index}`}
                      name="tcSlice"
                      value={item.tcSlice}
                      onChange={(e) => handleChange(e, index, 'southNodeAdapterNetworkServiceTemplate', 'applications')}
                      className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 focus:ring focus:ring-indigo-200"
                    >
                      <option value="" disabled>Select slice</option>
                      {sliceApplicationOptions.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Resource Consumption Selector */}
                  <div className="flex-1">
                    <select
                      id={`resourceConsumption-${index}`}
                      name="resourceConsumption"
                      value={item.resourceConsumption}
                      onChange={(e) => handleChange(e, index, 'southNodeAdapterNetworkServiceTemplate', 'applications')}
                      className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 focus:ring focus:ring-indigo-200"
                    >
                      <option value="" disabled>Select resource consumption</option>
                      {resourceConsumptionOptions.map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Flavour Selector */}
                  <div className="flex-1">
                    <select
                      id={`flavourId-${index}`}
                      name="flavourId"
                      value={item.flavourId}
                      onChange={(e) => handleChange(e, index, 'southNodeAdapterNetworkServiceTemplate', 'applications')}
                      className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 focus:ring focus:ring-indigo-200"
                    >
                      <option value="" disabled>Select flavour</option>
                      {(item.flavourIdOptions || []).map((option, idx) => (
                        <option key={idx} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Remove Button */}
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => removeSlice(index, 'southNodeAdapterNetworkServiceTemplate', 'applications')}
                    className={index === 0 ? 'invisible' : 'text-red-500'}
                  >
                    <MinusCircleIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>







        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={() => addSlice('southNodeAdapterNetworkServiceTemplate', 'applications')}
            className="flex items-center font-bold"
          >
            <PlusCircleIcon className="w-6 h-6 mr-2 " />
            Add more 
          </button>
        </div>

        <div className="divider mt-12"><b>Select GPSI & Slice</b></div>

        <ul className="list-decimal pl-6">
        {nst.southNodeAdapterNetworkServiceTemplate.subscriptions.map((item, index) => (
          <li key={index} className="mb-4">
            <div className="flex items-center space-x-4">
              {/* Select GPSI */}
              <div className="w-1/2">
                <select
                  id={`gpsi-${index}`}
                  name="gpsi"
                  value={item.gpsi}
                  onChange={(e) => handleChange(e, index, 'southNodeAdapterNetworkServiceTemplate', 'subscriptions')}
                  className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 focus:ring focus:ring-indigo-200"
                >
                  <option value="" disabled>Select GPSI</option>
                  {gpsiOptions.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Slice */}
              <div className="w-1/2">
                <select
                  id={`tcSlice-${index}`}
                  name="tcSlice"
                  value={item.tcSlice}
                  onChange={(e) => handleChange(e, index, 'southNodeAdapterNetworkServiceTemplate', 'subscriptions')}
                  className="shadow-sm border rounded w-full py-2 px-3 text-gray-700 focus:ring focus:ring-indigo-200"
                >
                  <option value="" disabled>Select slice</option>
                  {sliceGpsiOptions.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Invisible or Visible Remove Button */}
              <div className="flex justify-end">
                {index > 0 ? (
                  <button
                    type="button"
                    onClick={() => removeSlice(index, 'southNodeAdapterNetworkServiceTemplate', 'subscriptions')}
                    className="text-red-500"
                  >
                    <MinusCircleIcon className="w-6 h-6" />
                  </button>
                ) : (
                  // Invisible button for alignment purposes
                  <button type="button" className="w-6 h-6 opacity-0 pointer-events-none">
                    <MinusCircleIcon />
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={() => addSlice('southNodeAdapterNetworkServiceTemplate', 'subscriptions')}
            className="flex items-center "
          >
            <PlusCircleIcon className="w-6 h-6 mr-2" />
            Add more
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            className={`px-4 py-2 rounded bg-blue-500 text-white ${!formValid ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!formValid}
          >
            {id ? 'Update NST' : 'Create NST'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NSTForm;
