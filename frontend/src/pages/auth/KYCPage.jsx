import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../hooks/useAuth';
import { submitKYC } from '../../services/auth.api';
import { toast } from 'react-toastify';
import { FiUpload, FiCheckCircle } from 'react-icons/fi';

const KYCPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [selfie, setSelfie] = useState(null);
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelfie(file);
      setPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  useEffect(() => {
    if (user?.kycStatus === 'verified') {
      navigate(user.role === 'business_owner' ? '/dashboard/business' : '/dashboard/investor');
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    if (!selfie) { toast.error('Please upload a selfie'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('aadhaarNumber', aadhaarNumber);
      formData.append('panNumber', panNumber);
      formData.append('selfie', selfie);
      const res = await submitKYC(formData);
      updateUser(res.data.data?.user || { kycStatus: 'pending' });
      setSuccess(true);
      toast.success('KYC submitted! Verification in progress.');
      setTimeout(() => {
        navigate(user.role === 'business_owner' ? '/dashboard/business' : '/dashboard/investor');
      }, 2000);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <FiCheckCircle className="mx-auto text-green-500 text-6xl mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">KYC Verified!</h2>
          <p className="text-gray-500 mt-2">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Complete KYC</h2>
        <p className="text-gray-500 text-center text-sm mb-6">Step {step} of 2</p>
        <div className="flex mb-6">
          <div className={`flex-1 h-1 rounded-l ${step >= 1 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
          <div className={`flex-1 h-1 rounded-r ${step >= 2 ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              <input value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="ABCDE1234F" maxLength={10} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
              <input value={aadhaarNumber} onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="1234 5678 9012" maxLength={12} />
              <p className="text-xs text-gray-400 mt-1">Encrypted and never stored in plain text</p>
            </div>
            <button onClick={() => { if (panNumber && aadhaarNumber) setStep(2); else toast.error('Fill all fields'); }}
              className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700">
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}`}>
              <input {...getInputProps()} />
              {preview ? (
                <img src={preview} alt="Selfie" className="w-32 h-32 rounded-full mx-auto object-cover" />
              ) : (
                <>
                  <FiUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Drag & drop or click to upload selfie</p>
                </>
              )}
            </div>
            <p className="text-xs text-gray-400">Clear photo of your face in good lighting</p>
            <div className="flex space-x-3">
              <button onClick={() => setStep(1)} className="flex-1 border py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">Back</button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50">
                {loading ? 'Verifying...' : 'Submit for Verification'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCPage;
