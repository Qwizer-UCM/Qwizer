import { useEffect, useState } from 'react';

const useFetch = (fetcher, {transform=(data) => data, onSuccess, onError, skip=false, params={}, deps=[]} = {}) => {
  const [data, setData] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    const abortController = new AbortController();
    const fetchData = async () => {
      try {
        const res = await fetcher(params, { signal: abortController.signal });
        //console.log("SET DATA",res)
        const resTransform = transform(res.data)
        setData(resTransform);
        if(onSuccess) onSuccess(resTransform);
      } catch (err) {
        if (err.name === 'CanceledError') {
          //console.log('Request Aborted');
        }else {
          console.log(err)
          setError(err);
          onError(err)
        }
      }
    };
    
    if(!skip)
      fetchData();

    return () => {
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps,skip]);

  return { data, error, isLoading: !data && !error };
};

export default useFetch;
