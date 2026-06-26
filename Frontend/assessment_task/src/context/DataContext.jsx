import { createContext, useContext, useEffect, useState } from 'react';
import { storage, uid } from '../lib/storage';

const DataCtx = createContext(null);

export const DataProvider = ({ children }) => {
  const [categoriesLib, setCategoriesLib] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    setCategoriesLib(storage.getCategoriesLib());
    setAssessments(storage.getAssessments());
    setResponses(storage.getResponses());
  }, []);

  const saveCategoriesLib = (next) => {
    setCategoriesLib(next);
    storage.setCategoriesLib(next);
  };

  const saveAssessments = (next) => {
    setAssessments(next);
    storage.setAssessments(next);
  };

  const saveResponses = (next) => {
    setResponses(next);
    storage.setResponses(next);
  };

  // Persist categories from builder into the library (dedupe by name)
  const persistCategoriesToLib = (cats) => {
    const lib = [...categoriesLib];
    cats.forEach((c) => {
      const idx = lib.findIndex(
        (x) => x.name.trim().toLowerCase() === c.name.trim().toLowerCase()
      );
      const cloned = { ...c, id: uid() };
      if (idx >= 0) lib[idx] = cloned;
      else lib.push(cloned);
    });
    saveCategoriesLib(lib);
  };

  const createAssessment = ({ title, description, categories }) => {
    const a = {
      id: uid(),
      title: title.trim(),
      description: (description || '').trim(),
      categories,
      createdAt: new Date().toISOString(),
    };
    const next = [a, ...assessments];
    saveAssessments(next);
    persistCategoriesToLib(categories);
    return a;
  };

  const submitResponse = ({ assessmentId, respondentName, answers }) => {
    const r = {
      id: uid(),
      assessmentId,
      respondentName: respondentName.trim() || 'Anonymous',
      answers,
      submittedAt: new Date().toISOString(),
    };
    saveResponses([r, ...responses]);
    return r;
  };

  return (
    <DataCtx.Provider
      value={{
        categoriesLib,
        assessments,
        responses,
        createAssessment,
        submitResponse,
      }}
    >
      {children}
    </DataCtx.Provider>
  );
};

export const useData = () => useContext(DataCtx);
