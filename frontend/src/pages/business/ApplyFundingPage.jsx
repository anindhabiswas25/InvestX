import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { submitBusinessApplication } from '../../services/business.api';
import { toast } from 'react-toastify';
import { FiUpload } from 'react-icons/fi';

const CATEGORIES = [
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'retail', label: 'Retail' },
  { value: 'services', label: 'Services' },
  { value: 'technology', label: 'Technology' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'education', label: 'Education' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'other', label: 'Other' },
];
const DURATION_OPTIONS = [6, 12, 24, 36, 60];

const ApplyFundingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { tokenPriceINR: 100, revenueSharePercentage: 10, revenueShareDuration: 12 },
  });

  const fundingGoal = watch('fundingGoal');
  const tokenPrice = watch('tokenPriceINR') || 100;
  const revShare = watch('revenueSharePercentage');
  const totalTokens = fundingGoal ? Math.floor(Number(fundingGoal) / Number(tokenPrice)) : 0;

  // Map frontend form fields to backend expected field names
  const FIELD_MAP = {
    businessName: 'name',
    tokenPriceINR: 'tokenPrice',
    revenueShareDuration: 'revenueSharingDuration',
    yearEstablished: 'yearsInOperation',
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v) {
          const mappedKey = FIELD_MAP[k] || k;
          formData.append(mappedKey, v);
        }
      });
      photos.forEach((f) => formData.append('photos', f));
      documents.forEach((f) => formData.append('documents', f));
      await submitBusinessApplication(formData);
      toast.success('Application submitted! Admin will review it shortly.');
      navigate('/dashboard/business');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((p) => Math.min(p + 1, 5));
  const prevStep = () => setStep((p) => Math.max(p - 1, 1));

  const inputCls = "w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply for Funding</h1>
        <p className="text-gray-500 text-sm mb-6">Step {step} of 5</p>

        {/* Progress */}
        <div className="flex gap-1 mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded ${step >= s ? 'bg-primary-500' : 'bg-gray-200'}`}></div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-xl border p-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                  <input {...register('businessName', { required: 'Required' })} className={inputCls} />
                  {errors.businessName && <p className="text-red-500 text-xs mt-1">{errors.businessName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select {...register('category', { required: 'Required' })} className={inputCls}>
                    <option value="">Select...</option>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea {...register('description', { required: 'Required' })} className={inputCls} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Established</label>
                    <input type="number" {...register('yearEstablished')} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employees</label>
                    <input type="number" {...register('employeeCount')} className={inputCls} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Location & Contact</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input {...register('address')} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input {...register('city', { required: 'Required' })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input {...register('state', { required: 'Required' })} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input {...register('pincode')} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input {...register('businessPhone')} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input {...register('website')} className={inputCls} placeholder="https://..." />
                </div>
              </div>
            )}

            {/* Step 3: Financial */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Financial Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Avg Monthly Revenue (INR)</label>
                    <input type="number" {...register('averageMonthlyRevenue')} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profit Margin (%)</label>
                    <input type="number" {...register('profitMargin')} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                  <input {...register('gstNumber')} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Documents (GST returns, bank statements)</label>
                  <input type="file" accept=".pdf,.jpg,.png" multiple onChange={(e) => setDocuments(Array.from(e.target.files))} className={inputCls} />
                </div>
              </div>
            )}

            {/* Step 4: Funding Terms */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Funding Terms</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Funding Goal (INR) *</label>
                  <input type="number" {...register('fundingGoal', { required: 'Required' })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Share (%): {revShare}%</label>
                  <input type="range" min="5" max="30" {...register('revenueSharePercentage')} className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Token Price (INR)</label>
                  <input type="number" {...register('tokenPriceINR')} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months)</label>
                  <select {...register('revenueShareDuration')} className={inputCls}>
                    {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d} months</option>)}
                  </select>
                </div>
                {fundingGoal && (
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    <p>You will issue <strong>{totalTokens} tokens</strong> at ₹{tokenPrice} each.</p>
                    <p>Investors will earn <strong>{revShare}%</strong> of your revenue share per token.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Media & Review */}
            {step === 5 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4">Business Media & Review</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Photos (up to 5)</label>
                  <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary-400">
                    <input type="file" accept="image/*" multiple onChange={(e) => setPhotos(Array.from(e.target.files).slice(0, 5))} className="hidden" id="photos" />
                    <label htmlFor="photos" className="cursor-pointer">
                      <FiUpload className="mx-auto text-2xl text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Click to upload photos</p>
                    </label>
                  </div>
                  {photos.length > 0 && <p className="text-xs text-gray-500 mt-1">{photos.length} file(s) selected</p>}
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p className="font-medium text-gray-700 mb-2">Review your details before submitting. Once submitted, your application will be reviewed by the admin with AI-assisted scoring.</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button type="button" onClick={prevStep} className="border px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50">Back</button>
            )}
            <div className="ml-auto">
              {step < 5 ? (
                <button type="button" onClick={nextStep} className="bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700">Next</button>
              ) : (
                <button type="submit" disabled={loading} className="bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyFundingPage;
