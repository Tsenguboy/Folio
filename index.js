import { useState } from 'react'
import message from 'Src/message'
import PropTypes from 'prop-types';
import React, { useEffect } from 'react'
import DTable from 'Src/widgets/DataTable2/DTable'
import secureLocalStorage from 'react-secure-storage'
import { fetchRequest } from 'Utilities/fetchRequest'
import { translations } from 'Utilities/translations'
import { useLocation, useNavigate } from 'react-router'
import { Tab } from 'semantic-ui-react'
import { Col, Row } from 'react-bootstrap'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement} from 'chart.js'
import { dashboardHomeworkByTeacherDtls, dashboardHomeworkByTeacherDtlsModal, dashboardHomeworkDetails, dashboardHomeworkInit } from 'Utilities/url'
import { Pie } from "react-chartjs-2";
import StatusBar from './components/statusChart'
import StatusModal from './components/StatusModal'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const Graph = () => {

    const locale = secureLocalStorage?.getItem('selectedLang') || 'mn'

    const [cloneData, setCloneData] = useState([])
    const [dateData, setDateData] = useState([])
    const dateClickHandler = (date) => {
        setDateData(date)
        setShowModal(true)
    }
    const byHWClassColumns = [
        {
            dataField: 'assignDate',
            text: translations(locale)?.homework?.assign_date,
            sort: true,
            formatter: (cell, row) => {
                const hasValue = cell !== undefined && cell !== null && cell !== '';
                if (hasValue)
                {
                    return(<div className='d-flex underline' onClick={() => dateClickHandler(row)}>
                        {cell}
                    </div>)
                }
                else
                {
                    return (<div className='d-flex' style={{justifyContent: 'right'}}>{'-'}</div>)
                }
            },
        },
        {
            dataField: 'dueDate',
            text: translations(locale)?.homework?.homework_due_date,
            sort: true
        },
        {
            dataField: 'createdDate',
            text: translations(locale)?.created_date,
            sort: true,
        },
        {
            dataField: 'TOTAL',
            text: translations(locale)?.total,
            sort: true,
            formatter: (cell) => {
                const hasValue = cell !== undefined && cell !== null && cell !== '';
                if (hasValue)
                    return(<div className='d-flex' style={{justifyContent: 'right'}}>{cell}</div>)
                else
                    return (<div className='d-flex' style={{justifyContent: 'right'}}>{'-'}</div>)
            },
        },
        {
            dataField: 'COMPLETE',
            text: translations(locale)?.homework?.complete,
            sort: true,
            formatter: (cell) => {
                const hasValue = cell !== undefined && cell !== null && cell !== '';
                if (hasValue)
                    return(<div className='d-flex' style={{justifyContent: 'right'}}>{cell}</div>)
                else
                    return (<div className='d-flex' style={{justifyContent: 'right'}}>{'-'}</div>)
            },
        },
        {
            dataField: 'INCOMPLETE',
            text: translations(locale)?.homework?.incomplete,
            sort: true,
            formatter: (cell) => {
                const hasValue = cell !== undefined && cell !== null && cell !== '';
                if (hasValue)
                    return(<div className='d-flex' style={{justifyContent: 'right'}}>{cell}</div>)
                else
                    return (<div className='d-flex' style={{justifyContent: 'right'}}>{'-'}</div>)
            },
        },
        {
            dataField: 'NO_ASSIGNMENT',
            text: translations(locale)?.homework?.not_done,
            sort: true,
            formatter: (cell) => {
                const hasValue = cell !== undefined && cell !== null && cell !== '';
                if (hasValue)
                    return(<div className='d-flex' style={{justifyContent: 'right'}}>{cell}</div>)
                else
                    return (<div className='d-flex' style={{justifyContent: 'right'}}>{'-'}</div>)
            },
        },
        {
            dataField: 'NOCHECK',
            text: translations(locale)?.homework?.not_checked,
            sort: true,
            formatter: (cell) => {
                const hasValue = cell !== undefined && cell !== null && cell !== '';
                if (hasValue)
                    return(<div className='d-flex' style={{justifyContent: 'right'}}>{cell}</div>)
                else
                    return (<div className='d-flex' style={{justifyContent: 'right'}}>{'-'}</div>)
            },
        },
    ]
    const options = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
        tooltips: {
            enabled: false,
        },
    }

    const config = {
        excelExport: true,
        showAllData: true,
        showPagination: false,
        defaultSort: [{ dataField: 'studentFirstName', order: 'asc' }],
    }
  
    const [showModal, setShowModal] = useState(false)
    const closeModal = () => {
        setShowModal(false)
    }
    const tabs = []
    const location = useLocation()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [tableData, setTableData] = useState([])
    const [pieChartTotal, setPieChartTotal] = useState(0)
    const [title, setTitle] = useState('placeHolderTitle')
    const [classNames, setClassNames] = useState([])    
    const [classNameWithData, setClassNameWithData] = useState([])
    const [pieDataLabels, setPieDataLabels] = useState()
    const [pieDataNumbers, setPieDataNumbers] = useState()

    const tabChangeHandler = (value) => {
        const handler = []
        for (let i=0;i<cloneData.length;i++) {
            if (cloneData[i].className === value) {
                handler.push(cloneData[i])
            } else if (value === 'No Class' && cloneData[i].className === null) {
                handler.push(cloneData[i])
            }
        }
        setTableData(handler)
    }

    const [homeworkData, setHomeworkData] = useState()
    
    // const homeworkData = {
    //     assignDate : '2019.01.01',
    //     dueDate : '2022.03.02',
    //     createdDate : '2015.04.23',
    //     homework : 'Page number 12',
    //     score : 100,
    //     fileName : 'test.pdf',
    // }

    const [studentInfoTableData, setStudentInfoTableData] = useState()
    useEffect(() => {
        setLoading(true)
        let params = {
            filter: 0,
            teacherFirstname: location?.state?.teacherFirstname,
            teacherLastname: location?.state?.teacherLastname,
            selectedSeason: location?.state?.selectedSeasonId,
            startDate: location?.state?.startDate,
            endDate: location?.state?.endDate,
            selectedHWDate: dateData?.assignDate,
            identify: dateData?.identification,
        }
        fetchRequest(dashboardHomeworkInit, 'POST', params)
            .then ((res) => {
                if (res?.success) {
                    console.log(res.data)
                } else {
                    message(res?.data?.message)
                }
                setLoading(false)
            })
            .catch (() => {
                message(translations(locale)?.err?.error_occurred)
                setLoading(false)
            })
        fetchRequest(dashboardHomeworkByTeacherDtlsModal, 'POST', params)
            .then ((res) => {
                if (res?.success) {
                    setStudentInfoTableData(res.data?.studentList)
                    console.log(res.data)
                    // setStudentInfoTableData(res?.data?.homeworkModal?.[0][0]?.group?.students)
                    setDateData(...dateData, {
                        homework: res?.data?.homeworkModal[0]?.description,
                        totalScore: res?.data?.homeworkModal[0]?.totalScore,
                        groupInfo: res?.data?.homeworkModal?.[0][0]?.group,
                        studentInfo: res?.data?.homeworkModal?.[0][0]?.group?.students
                    })
                } else {
                    message(res?.data?.message)
                }
                setLoading(false)
            })
            .catch (() => {
                message(translations(locale)?.err?.error_occurred)
                setLoading(false)
            })
    }, [showModal])

    useEffect(() => {
        setLoading(true)
        let params = {
            teacherFirstname: location?.state?.teacherFirstname,
            teacherLastname: location?.state?.teacherLastname,
            selectedSeason: location?.state?.selectedSeasonId,
            startDate: location?.state?.startDate,
            endDate: location?.state?.endDate,
        }
        fetchRequest(dashboardHomeworkByTeacherDtls, 'POST', params)
            .then ((res) => {
                if (res?.success) {
                    let total = 0
                    const { homeworks } = res.data
                    setCloneData(homeworks)
                    const uniqueClasses = [...new Set(homeworks.map(obj => obj.className))];
                    setClassNames(uniqueClasses)
                    const handler1 = []
                    const newArray = []
                    const labelHolder = []
                    const numberHolder = []
                    const classNamesMap = {}
                    for (let i=0;i<homeworks.length;i++) {
                        for (let j=0;j<uniqueClasses.length;j++) {
                            if (homeworks[i].className === uniqueClasses[j]) {
                                handler1.push({
                                    classNames: uniqueClasses[j],
                                    classHWs: homeworks[i].TOTAL,
                                })
                            }
                        }
                    }
                    handler1.forEach((obj) => {
                        const { classNames, classHWs } = obj
                        if (classNames in classNamesMap) {
                            classNamesMap[classNames].classHWs += classHWs
                        } else {
                            classNamesMap[classNames] = { classNames, classHWs }
                            newArray.push(classNamesMap[classNames])
                        }
                    })
                    setClassNameWithData(newArray)
                    for (let i=0;i<newArray.length;i++) {
                        labelHolder.push(newArray[i].classNames)
                        numberHolder.push(newArray[i].classHWs)
                        total += newArray[i].classHWs
                    }
                    setPieDataLabels(labelHolder)
                    setPieDataNumbers(numberHolder)
                    const handler = []
                    for (let i=0;i<homeworks.length;i++) {
                        if (homeworks[i].className === uniqueClasses[0]) {
                            handler.push(homeworks[i])
                        }
                    }
                    console.log(handler)
                    setTableData(handler)
                    setPieChartTotal(total)
                    setLoading(false)
                } else {
                    message(res?.data?.message)
                }
                setLoading(false)
            })
            .catch(() => {
                message(translations(locale)?.err?.error_occurred)
                setLoading(false)
            })
    },[Graph])

    const data = {
        labels: pieDataLabels,
        datasets: [
        {
            data: pieDataNumbers,
            backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#ff32a2", "#ccd232" ],
        },
        ],
    };
    for (let i = 0; i < classNames.length; i++) {
        if (classNames[i] === null) {
            const tab = {
                menuItem: 'No Class',
                render: () => (
                <>
                    <div>
                        <div className="m-portlet__body">
                            <DTable
                                locale={locale}
                                config={config}
                                data={tableData}
                                columns={byHWClassColumns}
                            />
                        </div>
                    </div>
                </>
                )
            }
            tabs.push(tab)
        } else {
            const tab = {
                menuItem: classNames[i],
                render: () => (
                <>
                    <div>
                        <div className="m-portlet__body">
                            <DTable
                                locale={locale}
                                config={config}
                                data={tableData}
                                columns={byHWClassColumns}
                            />
                        </div>
                    </div>
                </>
                )
            }
            tabs.push(tab)
        }
    }

    return (
        <div className='m-grid__item m-grid__item--fluid m-wrapper'>
            <div className ='m-content'>
                <div className='m-portlet' style={{paddingBottom: '0.5rem'}}>
                    <div className='m-portlet__head justify-content-between align-items-center pr-0 pl-4'>
                        <span className='fs-13 pinnacle-bold' style={{ color: '#ff5b1d' }}>{title}</span>
                        <button className='btn m-btn--pill btn-link m-btn m-btn--custom' onClick={() => navigate(-1)}>
                            {translations(locale)?.back}
                        </button>
                    </div>
                    <div className='d-flex' style={{alignItems: 'stretch' }}>
                        <div className='m-portlet__body  ml-4 mr-4 mb-4 mt-4' style={{ justifyContent: 'center', alignItems: 'center', border: 'solid 1px rgba(255, 91, 29, 0.1)', borderRadius: '8px'}}>
                            <Row className='mb-4' style={{  justifyContent: 'space-between', paddingLeft: '1.5rem', paddingRight: '1.5rem', alignItems: 'center'}}>
                                <Col style={{ textAlign: 'left', fontFamily: 'PinnacleBold', fontSize: '20px' }}>{translations(locale)?.total}</Col>
                                <Col style={{ textAlign: 'right', fontFamily: 'PinnacleBold', fontSize: '25px', color: '#ff5b1d' }}>{pieChartTotal}</Col>
                            </Row>
                            <Row style={{justifyContent: 'center'}}>
                                <div className = 'd-flex' style={{ maxHeight: '300px', width: '80%', justifyContent: 'center' }}>
                                    <Pie data={data} options={options} />
                                </div>
                            </Row>
                        </div>
                        <div className='mr-4 mb-4 mt-4' style={{flex: 1, border: 'solid 1px rgba(255, 91, 29, 0.1)', borderRadius: '8px'}}>
                            <StatusBar classDatas = {classNameWithData}/>
                        </div>
                        <div>
                        </div>
                    </div>
                    <div className='ml-4 mr-4 mt-4 mb-4' style={{border: 'solid 1px rgba(255, 91, 29, 0.1)', borderRadius: '8px'}}>
                        <Tab
                            menu={{ secondary: true, pointing: true, className: 'primaryColor m-0 h-4'}}
                            onTabChange={(e,data) => tabChangeHandler(data?.panes[data?.activeIndex]?.menuItem)}
                            panes={tabs}
                        />
                    </div>
                </div>
            </div>
            {
                showModal &&
                <StatusModal
                    onClose={closeModal}
                    title={'titleHolder'}
                    locale={locale}
                    data={dateData}
                    studentData={studentInfoTableData}
                />
            }
            {
                loading &&
                <>
                    <div className='blockUI blockOverlay' />
                    <div className='blockUI blockMsg blockPage'>
                        <div className='m-loader m-loader--brand m-loader--lg' />
                    </div>
                </>
            }
        </div >
    )
}

export default Graph