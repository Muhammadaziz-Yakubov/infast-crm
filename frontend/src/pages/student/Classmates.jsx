import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineUserGroup, HiOutlineArrowLeft, HiOutlineChevronRight, HiOutlineLightningBolt, HiOutlineSparkles } from 'react-icons/hi';

const Classmates = () => {
    const navigate = useNavigate();
    const [classmates, setClassmates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClassmates();
    }, []);

    const fetchClassmates = async () => {
        try {
            const res = await studentAPI.getClassmates();
            setClassmates(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner text="Guruhdoshlar yuklanmoqda..." />;

    return (
        <div className="min-h-screen pb-20 animate-fade-in max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 py-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 rounded-2xl bg-white dark:bg-dark-800 text-gray-500 shadow-sm border border-gray-100 dark:border-white/5 active:scale-95 transition-all outline-none"
                >
                    <HiOutlineArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                        Mening <span className="text-primary-500">Guruhdoshlarim</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{classmates.length} ta a'zo</p>
                </div>
                <div className="w-12" />
            </div>

            <div className="space-y-4">
                {classmates.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                        <HiOutlineUserGroup className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic text-[10px]">Hech kim topilmadi</p>
                    </div>
                ) : (
                    classmates.map((student, index) => (
                        <Link
                            key={student._id}
                            to={`/classmate-profile/${student._id}`}
                            className="group flex items-center justify-between p-4 bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary-500/10 shadow-lg group-hover:scale-110 transition-transform duration-500 bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
                                        {student.profileImage ? (
                                            <img src={student.profileImage} alt={student.ism} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary-500/10 text-primary-500 font-black text-xl italic drop-shadow-sm">
                                                {student.ism?.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white truncate uppercase italic tracking-tight group-hover:text-primary-500 transition-colors">
                                        {student.ism}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-amber-500">🪙</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.coins || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-dark-900 flex items-center justify-center text-gray-300 group-hover:bg-primary-500 group-hover:text-white transition-all transform group-hover:translate-x-1 shadow-inner">
                                <HiOutlineChevronRight className="w-5 h-5" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default Classmates;
