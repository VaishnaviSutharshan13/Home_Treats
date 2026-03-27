import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaClock, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { feesService } from '../../services';
import Sidebar from '../../components/layout/Sidebar';

interface Fee {
  _id: string;
  feeType: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid';
  notes?: string;
}

const MyFees = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);

  const getStudentId = () => {
    if (user?.studentId) return user.studentId;
    const localUser = JSON.parse(localStorage.getItem('user') || '{}');
    return localUser?.studentId || '';
  };

  useEffect(() => {
    const fetchFees = async () => {
      try {
        setLoading(true);
        const studentId = getStudentId();
        if (!studentId) return;

        const res = await feesService.getByStudent(studentId);
        setFees(res.data || []);
      } catch (err) {
        console.error('Failed to load fees');
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, [user]);

  const handlePayNow = () => {
    alert("Payment Gateway Integration Coming Soon!");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} userRole="student" />
      
      <div className="flex-1 lg:ml-64 p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Fees</h1>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading fees...</div>
        ) : fees.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-gray-500 text-lg">No fees assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {fees.map((fee) => (
              <div 
                key={fee._id} 
                className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col justify-between ${
                  fee.status === 'paid' ? 'border-green-100' : 'border-yellow-100'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 ${
                      fee.status === 'paid' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {fee.status === 'paid' ? <FaCheckCircle /> : <FaClock />}
                      {fee.status}
                    </span>
                    <span className="text-sm font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">
                      {fee.feeType}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm text-gray-500 uppercase tracking-wide">Amount Due</p>
                    <p className="text-3xl font-bold text-gray-800">
                      LKR {fee.amount.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2 mt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Due Date</span>
                      <span className="font-medium text-gray-800">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    {fee.notes && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Note</span>
                        <span className="font-medium text-gray-600">{fee.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button 
                    onClick={handlePayNow}
                    disabled={fee.status === 'paid'}
                    className={`w-full py-3 rounded-lg font-medium tracking-wide transition flex items-center justify-center gap-2 ${
                      fee.status === 'paid' 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <FaMoneyBillWave />
                    {fee.status === 'paid' ? 'Settled' : 'Pay Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFees;
