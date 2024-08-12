import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchRates, addRate, updateRate, deactivateRate, searchRates } from '../../../redux/actions/rateAction';
import { FcFolder, FcOpenedFolder, FcPlus, FcSalesPerformance, FcSearch, FcPrevious, FcViewDetails, FcEmptyTrash } from "react-icons/fc";
//REDUXISM
import { fetchDepartments } from '../../../redux/actions/departmentAction';
//MODALS
import AddRateModal from '../../modals/rates/AddRateModal';
import DeactivateRateModal from '../../modals/rates/DeactivateRateModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Rates = (props) => {
  const [isAddRateDetailsModal, setIsAddRateDetailsModal] = useState(false);
  const [isDeactivateRateModal, setIsDeactivateRateModal] = useState(false);
  const [selectedRateId, setSelectedRateId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await props.fetchRates();
        props.fetchDepartments();
      } catch (error) {
        toast.error('Failed to fetch rates.');
      }
    };
    fetchData();
  }, [props.fetchRates]);

  const handleDeactivateRate = (rateId) => {
    setSelectedRateId(rateId);
    setIsDeactivateRateModal(true);
  };

  const confirmDeactivateRate = async () => {
    setIsDeactivateRateModal(false);
    try {
      await props.deactivateRate(selectedRateId);
      await props.fetchRates();
    } catch (error) {
      toast.error('Failed to deactivate rate.');
    }
  };

  // Handle search and data filtering
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to the first page when search query changes
    props.searchRates(e.target.value);
  };
  

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Get department data
  const departmentsObjectDataCollection = props.departmentData?.departments?.data?.details;

  const getDepartmentNameById = (departmentId) => {
    const department = departmentsObjectDataCollection?.find(dept => dept.id === departmentId);
    return department ? department.department_name : 'Unknown Department';
  };

  // Filter and paginate rates
  const filteredRates = props.ratesData?.rates.filter(rate => 
    rate.rate_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastRate = currentPage * itemsPerPage;
  const indexOfFirstRate = indexOfLastRate - itemsPerPage;
  const currentRates = filteredRates?.slice(indexOfFirstRate, indexOfLastRate);

  const totalPages = Math.ceil(filteredRates.length / itemsPerPage);

  return (
    <div className='h-full max-h-full w-full max-w-full glass mx-auto p-4 shadow-slate-900/100'>
      <ToastContainer />
      <AddRateModal
        isOpen={isAddRateDetailsModal}
        onClose={() => setIsAddRateDetailsModal(false)}
      />
      <DeactivateRateModal
        isOpen={isDeactivateRateModal}
        onClose={() => setIsDeactivateRateModal(false)}
        deactivateRate={confirmDeactivateRate}
      />
      <div className="flex flex-col bg-transparent mb-10">
        <div className="flex items-center text-sm breadcrumbs">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className='flex items-center hover:text-white'>
                <FcPrevious style={{ height: "2rem", width: "2rem" }} />
                <span className="ml-2">Home</span>
              </Link>
            </li>
            <li>
              <Link to="/employee/dashboard" className='flex items-center hover:text-white'>
                <FcFolder style={{ height: "2rem", width: "2rem" }} />
                <span className="ml-2">Rates</span>
              </Link>
            </li>
            <li>
              <Link to="" className='flex items-center hover:text-white'>
                <FcOpenedFolder style={{ height: "2rem", width: "2rem" }} />
                <span className="ml-2">Data</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 rounded-lg">
        <div className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500">
          <div className='glass'>
            <div className="grid grid-cols-3 items-center mt-5">
              <div>
                <span className="inline-grid grid-cols-3 gap-4 py-5">
                  <div className="p-3 flex justify-start">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="border-b-4 bg-transparent text-md rounded text-black custom-placeholder-text-color"
                    />
                  </div>
                  <div className="p-3 flex justify-end">
                    <FcSearch style={{ height: "2rem", width: "2rem" }} />
                  </div>
                </span>
              </div>
              <div className="pb-5 pt-5 flex justify-center">
                <h3 className="font-bold text-4xl text-black">RATE LIST</h3>
              </div>
              <div className="p-3 flex justify-end">
                <FcPlus onClick={() => {
                  setIsAddRateDetailsModal(true);
                }} 
                style={{ height: "3rem", width: "3rem" }} 
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 flex flex-col items-center justify-center">
            {props.loading ? (
              <div className="flex flex-col gap-4 w-full max-w-5xl ps-2 pe-2">
                <div className="skeleton h-48 w-full"></div>
                <div className="skeleton h-6 w-36"></div>
                <div className="skeleton h-6 w-full"></div>
                <div className="skeleton h-6 w-full"></div>
              </div>
            ) : filteredRates.length === 0 ? (
              <div className="w-full max-w-5xl text-center text-lg font-semibold text-gray-500">
                No results found for "{searchQuery}"
              </div>
            ) : currentRates?.length > 0 ? (
              <div className="w-full max-w-5xl">
                <table className="table glass w-full border-2 border-black">
                  <thead className="text-red">
                    <tr className="md:table-row" style={{ fontSize: "17px", backgroundColor: 'black', color: "white" }}>
                      <th className="md:table-cell text-white"></th>
                      <th className="md:table-cell text-white">NAME</th>
                      <th className="md:table-cell text-white">AMOUNT</th>
                      <th className="md:table-cell text-white">DETAILS</th>
                      <th className="md:table-cell text-white">DESCRIPTION</th>
                      <th className="md:table-cell text-white">DEPARTMENT</th>
                      <th className="md:table-cell text-white">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className='text-black'>
                    {currentRates.map((item) => (
                      item.rate_status_id !== 0 && (
                        <tr className="md:table-row" key={item.id}>
                          <td className="md:table-cell"><FcSalesPerformance style={{ fontSize: "40px", color: "transparent" }} /></td>
                          <td className="md:table-cell">{item.rate_name}</td>
                          <td className="md:table-cell">
                            <span>&#8369;</span>
                            <b>{item.rate_amount_per_day}</b>
                          </td>
                          <td className="md:table-cell">{item.rate_details}</td>
                          <td className="md:table-cell">{item.rate_description}</td>
                          <td className="md:table-cell text-center">
                            {getDepartmentNameById(item.rate_department_id)}
                          </td>
                          <td className="md:table-cell">
                            <div className="flex items-center space-x-2">
                              <FcViewDetails style={{ height: "2rem", width: "2rem" }} />
                              <FcEmptyTrash
                                onClick={() => handleDeactivateRate(item.id)}
                                style={{ height: "2rem", width: "2rem" }}
                              />
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-center mt-4 mb-4">
                  <div className="join grid grid-cols-2">
                    <button
                      className="join-item btn btn-outline"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <button
                      className="join-item btn btn-outline"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>No rates available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    ratesData: state.rateState,
    loading: state.rateState.loading,
    departmentData: state.departmentState,
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchRates: () => dispatch(fetchRates()),
    addRate: (AddRateData) => dispatch(addRate(AddRateData)),
    updateRate: (UpdateRateData) => dispatch(updateRate(UpdateRateData)),
    deactivateRate: (RateId) => dispatch(deactivateRate(RateId)),
    fetchDepartments: () => dispatch(fetchDepartments()),
    searchRates: (query) => dispatch(searchRates(query)),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Rates);
