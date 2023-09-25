import {useEffect} from 'react'
import message from 'Src/message'
import SubHeader from 'Src/SubHeader'
import React, {useState} from 'react'
import secureLocalStorage from 'react-secure-storage'
import {Col, Container, Row} from 'react-bootstrap'
import {fetchRequest} from 'Utilities/fetchRequest'
import {translations} from 'Utilities/translations'
import StudentRelationModal from './modal/studentRelation'
import EventsModal from './modal/events'
import DayPickerInput from 'react-day-picker/DayPickerInput'
import StudentAttendanceModal from './modal/studentAttendance'
import StudentAttendanceNotSentModal from './modal/studentAttendanceNotSent'
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement} from 'chart.js'
import {dashboardAttendance, 
    dashboardHomework, 
    dashboardRelation, 
    dashboardNewsFeed,
    dashboardTodayExam,
    dashboardCalendarInit,} from 'Utilities/url'
import TodayEvents from './components/TodayEvents'
import NewsFeed from './components/newsfeed'
import ExamInfo from './components/examInfo'
import Chartsa from './components/barchart'

const index = () => {
    ChartJS.register(CategoryScale, LinearScale, BarElement)
    ChartJS.defaults.font.family = 'MulishRegular'

    const locale = secureLocalStorage?.getItem('selectedLang') || 'mn'

    const styles = {
        color: {
            orange: {
                color: '#ff5b1d'
            },
            green: {
                color: '#47c6ad'
            },
            grey: {
                color: '#575962'
            },
            darkGrey: {
                color: '#3c3f42'
            },
            blue: {
                color: '#0275d8'
            },
            red: {
                color: '#ff2f19'
            }
        },
        fontWeight: {
            fontWeight: 600,
        },
        border: {
            border: 'solid 1px rgba(255, 91, 29, 0.1)',
        },
    }

    const [loading, setLoading] = useState(false)

    const [studentRelationReport, setStudentRelationReport] = useState([])
    const [showStudentRelationModal, setShowStudentRelationModal] = useState(false)
    const [schoolTotalStudentRelationReport, setSchoolTotalStudentRelationReport] = useState({})

    const [attendanceReport, setAttendanceReport] = useState({})
    const [attendanceReportType, setAttendanceReportType] = useState('')
    const [showStudentAttendanceModal, setShowStudentAttendanceModal] = useState(false)
    const [showStudentAttendanceNotSentModal, setShowStudentAttendanceNotSentModal] = useState(false)
    const [attendanceReportDay, setAttendanceReportDay] = useState(new Date()?.toISOString()?.split('T')?.[0])
    const [todayDate, setTodayDate] = useState(new Date()?.toISOString()?.split('T')?.[0])
    const [homeworkReportData, setHomeworkReportData] = useState({})

    const [showAllEventsModal, setShowAllEventsModal] = useState(false)

    useEffect(() => {
        setLoading(true)
        fetchRequest(dashboardRelation, 'POST')
            .then((res) => {
                if (res.success) {
                    const {parentStatus, schoolStatus } = res.data
                    setStudentRelationReport(parentStatus || [])
                    setSchoolTotalStudentRelationReport(schoolStatus || {})
                } else {
                    message(res.data.message)
                }
                setLoading(false)
            })
            .then(() => {
                setTimeout(() => {
                    fetchHomework(attendanceReportDay)
                }, 300);
            })
            .then(() => {
                setTimeout(() => {
                    fetchAttendance(attendanceReportDay)
                }, 600);
            })
            .catch(() => {
                message(translations(locale)?.err?.error_occurred)
                setLoading(false)
            })
    }, [])

    const fetchHomework = (date) => {
        setLoading(true)
        fetchRequest(dashboardHomework, 'POST', {date })
            .then((res) => {
                if (res.success) {
                    const {totalCount, checkCount } = res.data
                    setHomeworkReportData({totalCount, checkCount })
                } else {
                    message(res.data.message)
                }
                setLoading(false)
            })
            .catch(() => {
                message(translations(locale)?.err?.error_occurred)
                setLoading(false)
            })
    }

    const [examData, setExamData] = useState()

    useEffect(() => {
        setLoading(true)
        fetchRequest(dashboardTodayExam, 'POST')
            .then ((res) => {
                if (res.success) {
                    const examHolder = []
                    for (let i=0;i<res.data?.exams?.length;i++){
                        if (res.data.exams[i].createdDate === todayDate){
                            examHolder.push(res.data.exams[i])
                        }
                    }
                    setExamData(examHolder)
                } else {
                    message(res.data.message)
                }
                setLoading(false)
            })
            .catch(() => {
                message(translations(locale)?.err?.error_occurred)
                setLoading(false)
            })
    },[])

    const [newsFeedData, setNewsFeedData] = useState([])

    useEffect(() => {
        setLoading(true)
        fetchRequest(dashboardNewsFeed, 'POST')
            .then ((res) => {
                if (res.success) {
                    const matchingDayFeed = []
                    for (let i=0;i<res.data.newsfeeds.length;i++){
                        if (res.data.newsfeeds[i].createdDate.slice(0,10) === todayDate){
                            matchingDayFeed.push(res.data.newsfeeds[i])
                        }
                    }
                    setNewsFeedData(matchingDayFeed || [])
                } else {
                    message(res.data.message)
                }
                setLoading(false)
            })
            .catch(() => {
                message(translations(locale)?.err?.error_occurred)
                setLoading(false)
            })
    }, [])

    const [events, setEvents] = useState([])

    useEffect(() => {
        setLoading(true)
        fetchRequest(dashboardCalendarInit, 'POST', {menu: 'school' })
            .then((res) => {
                if (res.success) {
                    const matchingDayEvents = []
                    for (let i=0;i<res.data.events.length;i++){
                        if (res.data.events[i].start.slice(0,10) === todayDate){
                            matchingDayEvents.push(res.data.events[i])
                        }
                    }
                    setEvents(matchingDayEvents || [])
                } else {
                    message(res.data.message)
                }
                setLoading(false)
            })
            .catch(() => {
                message(translations(locale)?.err?.error_occurred)
                setLoading(false)
            })
    },[])

    const fetchAttendance = (date) => {
        setTimeout(() => {
            setLoading(true)
            fetchRequest(dashboardAttendance, 'POST', {date })
                .then((res) => {
                    if (res.success) {
                        const {cardData } = res.data
                        setAttendanceReport(cardData || {})
                    } else {
                        message(res.data.message)
                    }
                    setLoading(false)
                })
                .catch(() => {
                    message(translations(locale)?.err?.error_occurred)
                    setLoading(false)
                })
        }, 500)
    }

    const handleDayChange = date => {
        fetchHomework(date)
        
        setTimeout(() => {
            fetchAttendance(date)
        }, 300);

        setTimeout(() => {
            setAttendanceReportDay(date)
        }, 600);
    }

    const handleStudentAttendance = type => {
        setAttendanceReportType(type)
        setShowStudentAttendanceModal(true)
    }

    const closeModal = () => {
        setAttendanceReportType('')
        setShowAllEventsModal(false)
        setShowStudentRelationModal(false)
        setShowStudentAttendanceModal(false)
        setShowStudentAttendanceNotSentModal(false)
    }

    return (
        <div className="m-grid__item m-grid__item--fluid m-wrapper">
            <SubHeader
                locale={locale}
                title={translations(locale)?.dashboard?.title}
            />
            <div className="m-content">
                <Row>
                    <Col md={3} className='pr-md-0'>
                        <div className="m-portlet">
                            <div className="m-portlet__body">
                                <span className='pinnacle-bold d-flex justify-content-start mb-3 fs-11' style={styles.color.orange} >
                                    {translations(locale)?.dashboard?.parents_access}
                                </span>
                                <div className='br-08 p-3' style={styles.border} >
                                    <div className='d-flex align-items-center justify-content-between mb-2'>
                                        <span className='pinnacle-bold fs-11' style={styles.color.orange}>
                                            {translations(locale)?.total}
                                        </span>
                                        <span className='pinnacle-demi-bold fs-13' style={styles.color.grey} >
                                            {schoolTotalStudentRelationReport?.percent}%
                                        </span>
                                    </div>
                                    <div className='d-flex align-items-center justify-content-between'>
                                        <span className='pinnacle-demi-bold fs-13' style={styles.color.grey}>
                                            {schoolTotalStudentRelationReport?.total}
                                        </span>
                                        <span className='pinnacle-bold fs-20' style={styles.color.green} >
                                            {schoolTotalStudentRelationReport?.parentsActive}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                    <Col md={9}>
                        <div className="m-portlet">
                            <div className="m-portlet__body">
                                <div className='d-flex align-items-center justify-content-between mb-3'>
                                    <span className='pinnacle-bold fs-11' style={{...styles.color.orange }} >
                                        {translations(locale)?.dashboard?.parents_and_guardians}
                                    </span>
                                    <span className='pointer fs-11' style={{...styles.color.grey, ...styles.fontWeight }}
                                        onClick={() => setShowStudentRelationModal(true)} >
                                        {translations(locale)?.dashboard_info?.see_all}
                                    </span>
                                </div>
                                <Container fluid>
                                    <Row className='gap-03'>
                                        {
                                            studentRelationReport?.sort((a, b) => b?.percent - a?.percent)?.slice(0, 5)?.map((el, key) => (
                                                <Col key={key} className='br-08 p-3' style={styles.border}>
                                                    <div className='d-flex align-items-center justify-content-between mb-2'>
                                                        <span className='pinnacle-bold fs-13' style={styles.color.orange}>
                                                            {el?.className}
                                                        </span>
                                                        <span className='pinnacle-demi-bold fs-13' style={styles.color.green}>
                                                            {el?.percent}%
                                                        </span>
                                                    </div>
                                                    <div className='d-flex align-items-center justify-content-between'>
                                                        <span className='pinnacle-demi-bold fs-13' style={styles.color.grey}>
                                                            {el?.studentCount} | {el?.relationCount}
                                                        </span>
                                                        <span className='pinnacle-bold fs-20' style={styles.color.blue}>
                                                            {el?.parents}
                                                        </span>
                                                    </div>
                                                </Col>
                                            ))
                                        }
                                    </Row>
                                </Container>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className="m-portlet">
                            <div className="m-portlet__body">
                                <div className='d-flex justify-content-between mb-3'>
                                    <span className='pinnacle-bold fs-11' style={styles.color.orange} >
                                        {translations(locale)?.dashboard_info?.today_attendance}
                                    </span>
                                    <DayPickerInput
                                        value={attendanceReportDay}
                                        inputProps={{className: 'form-control' }}
                                        onDayChange={(day) => handleDayChange(day?.toISOString()?.split('T')?.[0])}
                                        dayPickerProps={{firstDayOfWeek: 1, disabledDays: {after: new Date() } }}
                                        classNames={{overlay: 'DayPickerInputOverlay', container: 'position-relative' }}
                                    />
                                </div>
                                <Container fluid>
                                    <Row className='gap-05'>
                                    <Col className='br-08 p-3 d-flex flex-column pointer' 
                                            style={{
                                                border: 'solid 1px rgba(255, 91, 29, 0.1)',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between'
                                            }}>
                                            <span className='pinnacle-bold fs-11 mb-2' style={styles.color.orange}>
                                                {attendanceReport?.cameName}
                                            </span>
                                            <div className='d-flex flex-column'>
                                                <span className='pinnacle-bold fs-20 text-right' style={{color: attendanceReport?.cameColor }}>
                                                    {attendanceReport?.came || 0}
                                                </span>
                                                <span className='fs-11 text-right' style={styles.color.darkGrey}>
                                                    {translations(locale)?.dashboardAttendence?.student_hour}
                                                </span>
                                            </div>
                                        </Col>
                                        <Col className='br-08 p-3 d-flex flex-column pointer' 
                                            onClick={() => handleStudentAttendance('late')}
                                            style={{
                                                border: 'solid 1px rgba(255, 91, 29, 0.1)',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between'
                                            }}>
                                            <span className='pinnacle-bold fs-11 mb-2' style={styles.color.orange}>
                                                {attendanceReport?.lateName}
                                            </span>
                                            <div className='d-flex flex-column'>
                                                <span className='pinnacle-bold fs-20 text-right' style={{color: '#696e92'/*color: attendanceReport?.lateColor*/ }}>
                                                    {attendanceReport?.late || 0}
                                                </span>
                                                <span className='fs-11 text-right' style={styles.color.darkGrey}>
                                                    {translations(locale)?.dashboardAttendence?.student_hour}
                                                </span>
                                            </div>
                                        </Col>
                                        <Col className='br-08 p-3 d-flex flex-column pointer' 
                                            onClick={() => handleStudentAttendance('nonatt')}
                                            style={{
                                                border: 'solid 1px rgba(255, 91, 29, 0.1)',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between'
                                            }}>
                                            <span className='pinnacle-bold fs-11 mb-2' style={styles.color.orange}>
                                                {attendanceReport?.nonattName}
                                            </span>
                                            <div className='d-flex flex-column'>
                                                <span className='pinnacle-bold fs-20 text-right' style={{color: '#e02020'/*color: attendanceReport?.nonattColor*/ }}>
                                                    {attendanceReport?.nonatt || 0}
                                                </span>
                                                <span className='fs-11 text-right' style={styles.color.darkGrey}>
                                                    {translations(locale)?.dashboardAttendence?.student_hour}
                                                </span>
                                            </div>
                                        </Col>
                                        <Col className='br-08 p-3 d-flex flex-column pointer' 
                                            onClick={() => handleStudentAttendance('sick')}
                                            style={{
                                                border: 'solid 1px rgba(255, 91, 29, 0.1)',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between'
                                            }}>
                                            <span className='pinnacle-bold fs-11 mb-2' style={styles.color.orange}>
                                                {attendanceReport?.sickName}
                                            </span>
                                            <div className='d-flex flex-column'>
                                                <span className='pinnacle-bold fs-20 text-right' style={{color: '#4037d7'/*color: attendanceReport?.sickColor*/ }}>
                                                    {attendanceReport?.sick || 0}
                                                </span>
                                                <span className='fs-11 text-right' style={styles.color.darkGrey}>
                                                    {translations(locale)?.dashboardAttendence?.student_hour}
                                                </span>
                                            </div>
                                        </Col>
                                        <Col className='br-08 p-3 d-flex flex-column pointer' 
                                            onClick={() => handleStudentAttendance('absent')}
                                            style={{
                                                border: 'solid 1px rgba(255, 91, 29, 0.1)',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between'
                                            }}>
                                            <span className='pinnacle-bold fs-11 mb-2' style={styles.color.orange}>
                                                {attendanceReport?.absentName}
                                            </span>
                                            <div className='d-flex flex-column'>
                                                <span className='pinnacle-bold fs-20 text-right' style={{color: attendanceReport?.absentColor }}>
                                                    {attendanceReport?.absent || 0}
                                                </span>
                                                <span className='fs-11 text-right' style={styles.color.darkGrey}>
                                                    {translations(locale)?.dashboardAttendence?.student_hour}
                                                </span>
                                            </div>
                                        </Col>
                                        <Col className='br-08 p-3 d-flex flex-column pointer' 
                                            onClick={() => setShowStudentAttendanceNotSentModal(true)}
                                            style={{
                                                border: 'solid 1px rgba(255, 91, 29, 0.1)',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between'
                                            }}>
                                            <span className='pinnacle-bold fs-11 mb-2' style={styles.color.orange}>
                                                {translations(locale)?.attendance?.not_sent}
                                            </span>
                                            <span className='pinnacle-bold fs-20 text-right' style={styles.color.red}>
                                                {attendanceReport?.notSent || 0}
                                            </span>
                                            <span className='fs-11 text-right' style={styles.color.darkGrey}>
                                                {translations(locale)?.period?.toLowerCase()}
                                            </span>
                                        </Col>
                                    </Row>
                                </Container>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Container fluid>
                    <Row className='gap-10 d-flex'>
                        <Col className = 'p-0' style={{flex: 1}}>
                            <Col className='p-0'>
                                <div className="m-portlet mb-3" style={{height:'300px', maxHeight: '300px'}}>
                                    <TodayEvents data = {events} showAllEvents={() => {
                                        setShowAllEventsModal(true)
                                    }}/>
                                </div>
                            </Col>
                            <Col className='p-0'>
                                <div className="m-portlet" style={{height: '230px'}}>
                                    <div className="m-portlet__body">
                                        <div className='d-flex justify-content-between mb-3'>
                                            <span className='pinnacle-bold fs-11' style={styles.color.orange} >
                                                {translations(locale)?.dashboard?.homework_today}
                                            </span>
                                        </div>
                                        <Chartsa homeworkReportData = {homeworkReportData} locale = {locale}/>
                                    </div>
                                </div>
                            </Col>
                            <Col className='p-0'>
                                <div className="m-portlet" style={{height: '300px', maxHeight: '300px', overflow: 'auto'}}>
                                    <div className="m-portlet__body">
                                        <div className='d-flex justify-content-between mb-3'>
                                            <span className='pinnacle-bold fs-11' style={styles.color.orange} >
                                                {translations(locale)?.dashboard?.exam_today}
                                            </span>
                                        </div>
                                        <ExamInfo data = {examData}/>
                                    </div>
                                </div>    
                            </Col>
                        </Col>
                        <Col className='p-0'>
                            <div className="m-portlet mb-3" style={{height:'856px', maxHeight: '856px', overflow: 'auto'}}>
                                <NewsFeed data = {newsFeedData}/>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
            {
                loading &&
                <>
                    <div className="blockUI blockOverlay" />
                    <div className="blockUI blockMsg blockPage">
                        <div className="m-loader m-loader--brand m-loader--lg" />
                    </div>
                </>
            }
            {
                showStudentRelationModal &&
                <StudentRelationModal
                    onClose={closeModal}
                    data={studentRelationReport}
                />
            }
            {
                showStudentAttendanceModal && attendanceReportDay && attendanceReportType &&
                <StudentAttendanceModal
                    onClose={closeModal}
                    date={attendanceReportDay}
                    code={attendanceReportType}
                />
            }
            {
                showStudentAttendanceNotSentModal && attendanceReportDay &&
                <StudentAttendanceNotSentModal
                    onClose={closeModal}
                    date={attendanceReportDay}
                />
            }
            {
                showAllEventsModal &&
                <EventsModal
                    onClose={closeModal}
                    events={events}
                    locale={locale}
                />
            }
        </div>
    )
}

export default index
