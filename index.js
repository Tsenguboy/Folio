import SubHeader from 'Src/SubHeader'
import React, { useEffect, useState } from 'react'
import secureLocalStorage from 'react-secure-storage'
import { Tab } from 'semantic-ui-react'
import { fetchRequest } from 'Utilities/fetchRequest'
import { translations } from 'Utilities/translations'
import DayPickerInput from 'react-day-picker/DayPickerInput'
import { NDropdown } from 'Widgets/Dropdown'
import ClassTable from './components/classTable'
import TeacherTable from './components/teacherTable'
import SubjectTable from './components/subjectTable'
import { dummyTeacherData, dummySubjectData, dummyClassData } from './icons/dummyTable'
import TimelineIcon from '@mui/icons-material/Timeline';
import { useNavigate, useLocation } from 'react-router';
import ClassTotalModal from './components/classModal/classTotalModal'
import ClassDateModal from './components/classModal/classDateModal'
import { dashboardHomeworkByTeacher, dashboardHomeworkInit, dashboardHomeworkByTeacherDtls, dashboardHomeworkBySubject, dashboardHomeworkByClass } from 'Utilities/url'
import message from 'Src/message'


const homeworkData = {
    assignDate : '2019.01.01',
    dueDate : '2022.03.02',
    createdDate : '2015.04.23',
    homework : 'Page number 12',
    score : 100,
    fileName : 'test.pdf',
}

const locale = secureLocalStorage?.getItem('selectedLang') || 'mn'

const attendance = () => {

    const navigate = useNavigate()
    const location = useLocation()

    const [teacherDates, setTeacherDates] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    })
    const [teacherTabData, setTeacherTabData] = useState({
        key: 'TeacherTabData',
        season: '',
        startDate: teacherDates.startDate,
        endDate: teacherDates.endDate,
    });

    const [seasons, setSeasons] = useState([])
    const [fetched, setFetched] = useState(false)
    const [loading, setLoading] = useState(false)

    const [subjectDates, setSubjectDates] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    })
    const [subjectTabData, setSubjectTabData] = useState({
        key: 'SubjectTabData',
        season: '',
        startDate: subjectDates.startDate,
        endDate: subjectDates.endDate,
    });

    const [classDates, setClassDates] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    })
    const [classTabData, setClassTabData] = useState({
        key: 'ClassTabData',
        season: '',
        startDate: classDates.startDate,
        endDate: classDates.endDate,
    });

    const [teacherSelectedSeason, setTeacherSeasonSelected] = useState(null)
    const [subjectSelectedSeason, setSubjectSeasonSelected] = useState(null)
    const [subjectSelectedSubject, setSubjectSelectedSubject] = useState(null)
    const [classSelectedSeason, setClassSeasonSelected] = useState(null)
    const [classSelectedSubject, setClassSelectedSubject] = useState(null)
    const [classSelectedClass, setClassSelectedClass] = useState(null)
    const [subjectOptions, setSubjectOptions] = useState()
    const [classOptions, setClassOptions] = useState()
    const [activeTab, setActiveTab] = useState(0)
    const [selectedSubTabIndex, setSelectedSubTabIndex] = useState(0)
    const [seasonStartDate, setSeasonStartDate] = useState(null)
    const [seasonEndDate, setSeasonEndDate] = useState(null)

    const teacherSeasonHandler = (value, data) => {
        setTeacherSeasonSelected(data.value)
        const index = data.options.findIndex(obj => obj.value === data.value)
        setSeasonStartDate(data.options[index].startDate)
        setSeasonEndDate(data.options[index].endDate)
        setTeacherTabData({...teacherTabData, season: data.value})
    }
    const subjectSeasonHandler = (value, data) => {
        setSubjectSeasonSelected(data.value)
        setSubjectTabData({...subjectTabData, season: data.value})
    }
    const subjectSubjectHandler = (value, data) => {
        setSubjectSelectedSubject(data.value)
        setSubjectTabData({...subjectTabData, subject: data.value})
    }
    const classSeasonHandler = (value, data) => {
        setClassSeasonSelected(data.value)
        setClassTabData({...classTabData, season: data.value})
    }
    const classSubjectHandler = (value, data) => {
        setClassSelectedSubject(data.value)
        setClassTabData({...classTabData, subject: data.value})
    }
    const classClassHandler = (value, data) => {
        setClassSelectedClass(data.value)
        setClassTabData({...classTabData, class: data.value})
    }

    const tableTotalClickTeacher = (value) => {
        navigate('/dashboard/graph', { state: { 
            teacherFirstname: value?.teacherFirstName,
            teacherLastname: value?.teacherLastName,
            startDate: seasonStartDate,
            endDate: seasonEndDate,
            selectedSeasonId: teacherSelectedSeason,
            }, replace: false })
    }
    const subjectTotalClickHandler = (value) => {
        const subject = subjectOptions.find(item=> item.value === subjectSelectedSubject)
        navigate('/dashboard/subjectInfo', { state: {
            expanse: true,
            teacherFirstname: value?.teacherFirstname,
            className: value?.className,
            subjectName: subject.text,
            startDate: seasonStartDate,
            endDate: seasonEndDate,
            selectedSeasonId: subjectSelectedSeason,
        }, replace: false})
    }
    const [showClassTotalModal, setShowClassTotalModal] = useState()
    const [showClassDateModal, setShowClassDateModal] = useState()
    const [classTotalData, setClassTotalData] = useState()
    const [classModalData, setClassModalData] = useState()
    const [selectedStudentLName, setSelectedStudentLName] = useState()
    const [selectedStudentFName, setSelectedStudentFName] = useState()
    const classTotalClickHandler = (value) => {
        setShowClassTotalModal(true)
        // setLoading(true)
        const subject = subjectOptions.find(item=> item.value === classSelectedSubject)
        const _class = classOptions.find(item=> item.value === classSelectedClass)
        console.log(value)
        setSelectedStudentLName(value.lastname)
        setSelectedStudentFName(value.firstname)
        let params = {
            detailed: true,
            selectedSeason: classSelectedSeason,
            selectedSubject: subject.text,
            selectedClass: _class.text,
            studentLastName: value.lastname,
            studentFirstName: value.firstname,
        }
        fetchRequest (dashboardHomeworkByClass, 'POST', params)
        .then ((res) =>{
            if (res?.success){
                console.log(res.data)
                const {homeworks} = res.data
                const {modalData} =res.data
                console.log(homeworks)
                setClassTotalData(homeworks)
                setClassModalData(modalData)
                setLoading(false)
            }
            setLoading(false)
        })
        .catch(() => {
            message(translations(locale)?.err?.error_occurred)
            setLoading(false)
        })
    }
    const [classDateTableData, setClassDateTableData] = useState([])
    const [classDateModalData, setClassDateModalData] = useState([])

    const classDateClickHandler = (value) => {
        setShowClassDateModal(true)
        console.log(value)
        const [w, monthDay, dayOfWeek] = value.split(' ');
        const [month, day] = monthDay.split('-');
        const currentYear = new Date().getFullYear();
        const dateObject = new Date(`${currentYear}-${month}-${day}`);
        const formattedDate = dateObject.toISOString().split('T')[0];
        // setLoading(true)
        const subject = subjectOptions.find(item=> item.value === classSelectedSubject)
        const _class = classOptions.find(item=> item.value === classSelectedClass)
        console.log(selectedStudentLName, selectedStudentFName)
        let params = {
            dateDetailed: true,
            selectedSeason: classSelectedSeason,
            selectedSubject: subject.text,
            selectedClass: _class.text,
            selectedDate: formattedDate,
            studentLastName: selectedStudentLName,
            studentFirstName: selectedStudentFName,
        }
        fetchRequest (dashboardHomeworkByClass, 'POST', params)
        .then ((res) =>{
            if (res?.success){
                console.log(res.data)
                const {homeworks} = res.data
                const {modalData} =res.data
                console.log(homeworks)
                setClassTotalData(homeworks)
                setClassModalData(modalData)
                setLoading(false)
            }
            setLoading(false)
        })
        .catch(() => {
            message(translations(locale)?.err?.error_occurred)
            setLoading(false)
        })
    }
    const closeModal = () => {
        setShowClassDateModal(false)
        setShowClassTotalModal(false)
    }

    useEffect(() => {
        setLoading(true)
        let params = {
            filter: 0,
            selectedSeason: teacherSelectedSeason
        }
        fetchRequest(dashboardHomeworkInit, 'POST', params)
        .then ((res) => {
            if (res?.success) {
                setSeasons(res.data?.seasons)
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
        setFetched(true)
    }, [fetched])



    const _subjectViewClickHandler = () => {
        setLoading(true)
        console.log(subjectOptions)
        const subject = subjectOptions.find(item=> item.value === subjectSelectedSubject)
        let params = {
            selectedSeason: subjectSelectedSeason,
            selectedSubject: subject.text,
        }
        fetchRequest (dashboardHomeworkBySubject, 'POST', params)
        .then ((res) =>{
            if (res?.success){
                console.log(res.data)
                const { homeworks } = res.data
                for (let i=0;i<homeworks.length;i++) {
                    homeworks[i].createdDate = homeworks[i].createdDate.date
                }
                const subjectInfo = [];
                const subjectOccurances = {};
                for (let i = 0; i < homeworks.length; i++) {
                    const { className, teacherFirstname } = homeworks[i];
                    const teacherKey = `${className}_${teacherFirstname}`;
                    if (subjectOccurances[teacherKey]) {
                        subjectOccurances[teacherKey]++;
                    } else {
                        subjectOccurances[teacherKey] = 1;
                    }
                }
                for (const teacherKey in subjectOccurances) {
                    const [className, teacherFirstname] = teacherKey.split('_');
                    const total = subjectOccurances[teacherKey];

                    subjectInfo.push({
                        className,
                        teacherFirstname,
                        total,
                    });
                }
                setSubjectTableData(subjectInfo)
                setLoading(false)
            }
            setLoading(false)
        })
        .catch(() => {
            message(translations(locale)?.err?.error_occurred)
            setLoading(false)
        })
    }
    const [classTableData, setClassTableData] = useState()
    const _classViewClickHandler = () => {
        // setLoading(true)
        const subject = subjectOptions.find(item=> item.value === classSelectedSubject)
        const _class = classOptions.find(item=> item.value === classSelectedClass)
        let params = {
            selectedSeason: classSelectedSeason,
            selectedSubject: subject.text,
            selectedClass: _class.text,
        }
        fetchRequest (dashboardHomeworkByClass, 'POST', params)
        .then ((res) =>{
            if (res?.success){
                console.log(res.data)
                const {homeworks} = res.data
                console.log(homeworks);
                const studentInfo = []
                const studentOccurances = {};
                const incomplete = 0
                for (let i = 0; i < homeworks.length; i++) {
                    const { lastname, firstname, className, code } = homeworks[i];
                    const { type } = homeworks[i];
                    const teacherKey = `${lastname}_${firstname}_${className}_${code}`;
                    const typeKey = `${type}`
                    console.log(typeKey)
                    if (studentOccurances[teacherKey]) {
                        studentOccurances[teacherKey]++;
                    } else {
                        studentOccurances[teacherKey] = 1;
                    }
                }
                console.log(studentOccurances)
                for (const teacherKey in studentOccurances) {
                    const [lastname, firstname, className, code] = teacherKey.split('_');
                    const total = studentOccurances[teacherKey];

                    studentInfo.push({
                        lastname,
                        firstname,
                        className,
                        code,
                        total,
                    });
                }
                console.log(studentInfo)
                setClassTableData(studentInfo)
                setLoading(false)
            }
            setLoading(false)
        })
        .catch(() => {
            message(translations(locale)?.err?.error_occurred)
            setLoading(false)
        })
    }

    const filterChange = (newFilter) => {
        setLoading(true)
        let params = {
            filter: newFilter,
            selectedSeason: teacherSelectedSeason,
        }
        fetchRequest(dashboardHomeworkInit, 'POST', params)
        .then ((res) => {
            if (res?.success) {
                if (newFilter === 0) {
                    setSeasons(res.data?.seasons)
                    setLoading(false)
                } else if (newFilter === 1) {
                    setSubjectOptions(res.data?.groups)
                    setSeasons(res.data?.seasons)
                    setLoading(false)
                } else if (newFilter === 2) {
                    setSubjectOptions(res.data?.groups)
                    setSeasons(res.data?.seasons)
                    setClassOptions(res.data?.classes)
                }
            } else {
                message(res?.data?.message)
            }
            setLoading(false)
        })
        .catch(() => {
            message(translations(locale)?.err?.error_occurred)
            setLoading(false)
        })
    }
    const [teacherTableData, setTeacherTableData] = useState([])
    const [subjectTableData, setSubjectTableData] = useState([])

    const viewClickHandler = () => {
        setLoading(true)
        let params = {
            selectedSeason: teacherSelectedSeason,
            startDate: seasonStartDate,
            endDate: seasonEndDate,
        }
        fetchRequest(dashboardHomeworkByTeacherDtls, 'POST', params)
            .then ((res) => {
                if (res?.success) {
                    console.log(res.data)
                }
            })
            .catch(() => {
                message(translations(locale)?.err?.error_occurred)
                setLoading(false)
            })
        fetchRequest(dashboardHomeworkByTeacher, 'POST', params)
            .then ((res) => {
                if (res?.success) {
                    const { homeworks } = res.data
                    console.log(res.data?.seasons)
                    let cloneData = []
                    for ( let i=0; i<homeworks.length; i++) {
                        cloneData.push({
                            createdDate: homeworks[i]?.createdDate?.date.slice(0,10),
                            teacherLastName: homeworks[i]?.lastName,
                            teacherFirstName: homeworks[i]?.firstName
                        })
                    }
                    const teacherInfo = [];
                    const teacherOccurrences = {};
                    for (let i = 0; i < cloneData.length; i++) {
                        const { teacherLastName, teacherFirstName } = cloneData[i];
                        const teacherKey = `${teacherLastName}_${teacherFirstName}`;
                        if (teacherOccurrences[teacherKey]) {
                            teacherOccurrences[teacherKey]++;
                        } else {
                            teacherOccurrences[teacherKey] = 1;
                        }
                    }
                    for (const teacherKey in teacherOccurrences) {
                        const [teacherLastName, teacherFirstName] = teacherKey.split('_');
                        const total = teacherOccurrences[teacherKey];

                        teacherInfo.push({
                            teacherLastName,
                            teacherFirstName,
                            total,
                        });
                    }
                    setTeacherTableData(teacherInfo)
                } else {
                    message(res?.data?.message)
                }
                setLoading(false)
            })
            .catch(() => {
                message(translations(locale)?.err?.error_occurred)
                setLoading(false)
            })
    }
    const [currentFilter, setCurrentFilter] = useState()
    return (
        <div className="m-grid__item m-grid__item--fluid m-wrapper">
            <SubHeader
                locale={locale}
                title={translations(locale)?.homework?.title}
            />
            <div className='m-content'>
                <div className='m-portlet'>
                    <Tab
                        activeIndex={activeTab}
                        onTabChange={(e, data) => {
                            setSelectedSubTabIndex(0)
                            setActiveTab(data?.activeIndex)
                            filterChange(data?.activeIndex)
                        }}
                        menu={{ secondary: true, pointing: true, className: 'primaryColor m-0 h-4' }}
                        panes={[
                            {
                                index: 0,
                                menuItem: translations(locale)?.homeworkDashboard?.by_teacher,
                                render: () =>
                                (
                                    <div className='m-portlet'>
                                        <div className='m-portlet__body'>
                                            <div>
                                                <div>
                                                    <div>
                                                        <div className = "d-flex ml-5 mb-5 mt-4" style={{justifyContent: 'center'}}>
                                                            <label className = 'd-flex modal-label ml-5' style={{fontWeight: 800,fontFamily: 'PinnacleBold',position: 'relative', top: 5}}>
                                                                {translations(locale)?.season}
                                                                {setCurrentFilter("TEACHER")}
                                                            </label>
                                                            <NDropdown
                                                                placeholder={'-' + translations(locale).select + '-' || ""}
                                                                fluid
                                                                selection
                                                                search={true}
                                                                additionPosition='bottom'
                                                                upward={false}
                                                                selectOnBlur={false}
                                                                style={{width: '25%'}}
                                                                value={teacherSelectedSeason}
                                                                options={seasons}
                                                                onChange={teacherSeasonHandler}
                                                            />
                                                            <div className='ml-5 d-flex'>
                                                                <label className = 'modal-label justify-content-start mr-2' style={{fontWeight: 800,  fontFamily: 'PinnacleBold', position: 'relative', top: 5}}>
                                                                    {translations(locale)?.date}
                                                                </label>
                                                                <div className='pr-0 justify-content-start'>
                                                                    <DayPickerInput
                                                                        value={seasonStartDate}
                                                                        inputProps={{ className: 'form-control' }}
                                                                        placeholder={translations(locale)?.datePickerPlaceholder}
                                                                        dayPickerProps={{ disabledDays: { after: new Date(teacherDates?.endDate) } }}
                                                                        classNames={{ overlay: 'DayPickerInputOverlay', container: 'position-relative' }}
                                                                        onDayChange={(day) => {
                                                                            setTeacherDates({ ...teacherDates, startDate: day?.toISOString()?.split('T')?.[0] })
                                                                            setTeacherTabData({...teacherTabData, startDate: day?.toISOString()?.split('T')?.[0]})}}
                                                                    />
                                                                </div>
                                                                <div className='pickerSeparator justify-content-center' style={{height: 33}}>
                                                                    <i className='la la-ellipsis-h' />
                                                                </div>
                                                                <div className='pl-0'>
                                                                    <DayPickerInput
                                                                        value={seasonEndDate}
                                                                        inputProps={{ className: 'form-control' }}
                                                                        placeholder={translations(locale)?.datePickerPlaceholder}
                                                                        dayPickerProps={{ disabledDays: { before: new Date(teacherDates?.startDate) } }}
                                                                        classNames={{ overlay: 'DayPickerInputOverlay', container: 'position-relative' }}
                                                                        onDayChange={(day) => {
                                                                            setTeacherDates({ ...teacherDates, endDate: day?.toISOString()?.split('T')?.[0] })
                                                                            setTeacherTabData({...teacherTabData, endDate: day?.toISOString()?.split('T')?.[0]})}}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="actions justify-content-center d-flex align-items-center" style={{ borderTop: '1px solid #e9ecef'}}>
                                                    <button
                                                        className='btn btn-sm m-btn--pill m-btn--uppercase mt-3 d-flex actions'
                                                        style={{borderRadius:'10px', backgroundColor: '#41c5dc', color: 'white'}}
                                                        onClick={() => viewClickHandler()}
                                                    >
                                                        <div className ='d-flex'>
                                                            <TimelineIcon className = 'd-flex' style={{ marginLeft: '0.5rem', marginRight: '0.5rem', padding: '0px'}}/>
                                                            <span style={{marginLeft: '0.5rem', marginRight: '0.5rem'}}>
                                                                {translations(locale)?.view}  
                                                            </span>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                index: 1,
                                menuItem: translations(locale)?.homeworkDashboard?.by_subject,
                                render: () =>
                                (
                                    <div className='m-portlet'>
                                        <div className='m-portlet__body'>
                                            <div>
                                                <div>
                                                    <div>
                                                        <div className = "d-flex mb-5 mt-4 mr-5" style={{justifyContent: 'flex-start'}}>
                                                        <label className = 'd-flex modal-label ml-5' style={{fontWeight: 800,fontFamily: 'PinnacleBold', position: 'relative', top: 5}}>
                                                            {translations(locale)?.subject?.title}
                                                            {setCurrentFilter("SUBJECT")}
                                                        </label>
                                                        <NDropdown
                                                            placeholder={'-' + translations(locale).select + '-' || ""}
                                                            fluid
                                                            selection
                                                            search={true}
                                                            additionPosition='bottom'
                                                            upward={false}
                                                            selectOnBlur={false}
                                                            style={{width: '25%'}}
                                                            value={subjectSelectedSubject}
                                                            options={subjectOptions}
                                                            onChange={subjectSubjectHandler}
                                                        />
                                                        <label className = 'd-flex modal-label ml-5' style={{fontWeight: 800,fontFamily: 'PinnacleBold', position: 'relative', top: 5}}>
                                                            {translations(locale)?.season}
                                                        </label>
                                                        <NDropdown
                                                            placeholder={'-' + translations(locale).select + '-' || ""}
                                                            fluid
                                                            selection
                                                            search={true}
                                                            additionPosition='bottom'
                                                            upward={false}
                                                            selectOnBlur={false}
                                                            style={{width: '25%'}}
                                                            value={subjectSelectedSeason}
                                                            options={seasons}
                                                            onChange={subjectSeasonHandler}
                                                        />
                                                            <div className='ml-5 d-flex'>
                                                                <label className = 'modal-label justify-content-start' style={{fontWeight: 800,  fontFamily: 'PinnacleBold', position: 'relative', top: 5}}>
                                                                    {translations(locale)?.date}
                                                                </label>
                                                                <div className='pr-0 justify-content-start'>
                                                                    <DayPickerInput
                                                                        value={teacherDates?.startDate}
                                                                        inputProps={{ className: 'form-control' }}
                                                                        placeholder={translations(locale)?.datePickerPlaceholder}
                                                                        dayPickerProps={{ disabledDays: { after: new Date(teacherDates?.endDate) } }}
                                                                        classNames={{ overlay: 'DayPickerInputOverlay', container: 'position-relative' }}
                                                                        onDayChange={(day) => {
                                                                            setSubjectDates({ ...subjectDates, startDate: day?.toISOString()?.split('T')?.[0] })
                                                                            setSubjectTabData({...subjectTabData, startDate: day?.toISOString()?.split('T')?.[0]})}}
                                                                    />
                                                                </div>
                                                                <div className='pickerSeparator justify-content-center' style={{height: 33}}>
                                                                    <i className='la la-ellipsis-h' />
                                                                </div>
                                                                <div className='pl-0'>
                                                                    <DayPickerInput
                                                                        value={teacherDates?.endDate}
                                                                        inputProps={{ className: 'form-control' }}
                                                                        placeholder={translations(locale)?.datePickerPlaceholder}
                                                                        dayPickerProps={{ disabledDays: { before: new Date(teacherDates?.startDate) } }}
                                                                        classNames={{ overlay: 'DayPickerInputOverlay', container: 'position-relative' }}
                                                                        onDayChange={(day) => {
                                                                            setSubjectDates({ ...subjectDates, endDate: day?.toISOString()?.split('T')?.[0] })
                                                                            setSubjectDates({...subjectTabData, endDate: day?.toISOString()?.split('T')?.[0]})}}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="actions justify-content-center d-flex align-items-center" style={{ borderTop: '1px solid #e9ecef'}}>
                                                    <button
                                                        className='btn btn-sm m-btn--pill m-btn--uppercase mt-3 d-flex actions'
                                                        style={{borderRadius:'10px', backgroundColor: '#41c5dc', color: 'white'}}
                                                        onClick={() => _subjectViewClickHandler()}
                                                    >
                                                        <div className ='d-flex'>
                                                            <TimelineIcon className = 'd-flex' style={{ marginLeft: '0.5rem', marginRight: '0.5rem', padding: '0px'}}/>
                                                            <span style={{marginLeft: '0.5rem', marginRight: '0.5rem'}}>
                                                                {translations(locale)?.view}  
                                                            </span>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            },
                            {
                                index: 2,
                                menuItem: translations(locale)?.homeworkDashboard?.by_class,
                                render: () =>
                                (
                                    <div className='m-portlet'>
                                        <div className='m-portlet__body'>
                                            <div>
                                                <div>
                                                    <div>
                                                        <div className = "d-flex mb-5 mt-4 mr-5" style={{justifyContent: 'flex-start'}}>
                                                        <label className = 'd-flex modal-label ml-5' style={{fontWeight: 800,fontFamily: 'PinnacleBold', position: 'relative', top: 5}}>
                                                            {translations(locale)?.subject?.title}
                                                            {setCurrentFilter("CLASS")}
                                                        </label>
                                                        <NDropdown
                                                            placeholder={'-' + translations(locale).select + '-' || ""}
                                                            fluid
                                                            selection
                                                            search={true}
                                                            additionPosition='bottom'
                                                            upward={false}
                                                            selectOnBlur={false}
                                                            style={{width: '20%'}}
                                                            value={classSelectedSubject}
                                                            options={subjectOptions}
                                                            onChange={classSubjectHandler}
                                                        />
                                                        <label className = 'd-flex modal-label ml-5' style={{fontWeight: 800,fontFamily: 'PinnacleBold', position: 'relative', top: 5}}>
                                                            {translations(locale)?.group?.title}
                                                        </label>
                                                        <NDropdown
                                                            placeholder={'-' + translations(locale).select + '-' || ""}
                                                            fluid
                                                            selection
                                                            search={true}
                                                            additionPosition='bottom'
                                                            upward={false}
                                                            selectOnBlur={false}
                                                            style={{width: '20%'}}
                                                            value={classSelectedClass}
                                                            options={classOptions}
                                                            onChange={classClassHandler}
                                                        />
                                                        <label className = 'd-flex modal-label ml-5' style={{fontWeight: 800,fontFamily: 'PinnacleBold', position: 'relative', top: 5}}>
                                                            {translations(locale)?.season}
                                                        </label>
                                                        <NDropdown
                                                            placeholder={'-' + translations(locale).select + '-' || ""}
                                                            fluid
                                                            selection
                                                            search={true}
                                                            additionPosition='bottom'
                                                            upward={false}
                                                            selectOnBlur={false}
                                                            style={{width: '20%'}}
                                                            value={classSelectedSeason}
                                                            options={seasons}
                                                            onChange={classSeasonHandler}
                                                        />
                                                            <div className='ml-5 d-flex'>
                                                                <label className = 'modal-label justify-content-start' style={{fontWeight: 800,  fontFamily: 'PinnacleBold', position: 'relative', top: 5}}>
                                                                    {translations(locale)?.date}
                                                                </label>
                                                                <div className='pr-0 justify-content-start'>
                                                                    <DayPickerInput
                                                                        value={teacherDates?.startDate}
                                                                        inputProps={{ className: 'form-control' }}
                                                                        placeholder={translations(locale)?.datePickerPlaceholder}
                                                                        dayPickerProps={{ disabledDays: { after: new Date(teacherDates?.endDate) } }}
                                                                        classNames={{ overlay: 'DayPickerInputOverlay', container: 'position-relative' }}
                                                                        onDayChange={(day) => {
                                                                            setSubjectDates({ ...subjectDates, startDate: day?.toISOString()?.split('T')?.[0] })
                                                                            setSubjectTabData({...subjectTabData, startDate: day?.toISOString()?.split('T')?.[0]})}}
                                                                    />
                                                                </div>
                                                                <div className='pickerSeparator justify-content-center' style={{height: 33}}>
                                                                    <i className='la la-ellipsis-h' />
                                                                </div>
                                                                <div className='pl-0'>
                                                                    <DayPickerInput
                                                                        value={teacherDates?.endDate}
                                                                        inputProps={{ className: 'form-control' }}
                                                                        placeholder={translations(locale)?.datePickerPlaceholder}
                                                                        dayPickerProps={{ disabledDays: { before: new Date(teacherDates?.startDate) } }}
                                                                        classNames={{ overlay: 'DayPickerInputOverlay', container: 'position-relative' }}
                                                                        onDayChange={(day) => {
                                                                            setSubjectDates({ ...subjectDates, endDate: day?.toISOString()?.split('T')?.[0] })
                                                                            setSubjectDates({...subjectTabData, endDate: day?.toISOString()?.split('T')?.[0]})}}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="actions justify-content-center d-flex align-items-center" style={{ borderTop: '1px solid #e9ecef'}}>
                                                    <button
                                                        className='btn btn-sm m-btn--pill m-btn--uppercase mt-3 d-flex actions'
                                                        style={{borderRadius:'10px', backgroundColor: '#41c5dc', color: 'white'}}
                                                        onClick={() => _classViewClickHandler()}
                                                    >
                                                        <div className ='d-flex'>
                                                            <TimelineIcon className = 'd-flex' style={{ marginLeft: '0.5rem', marginRight: '0.5rem', padding: '0px'}}/>
                                                            <span style={{marginLeft: '0.5rem', marginRight: '0.5rem'}}>
                                                                {translations(locale)?.view}  
                                                            </span>
                                                        </div>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        ]}
                    />
                </div>
                {
                    activeTab===0 &&
                    <div className='m-portlet'>
                        <TeacherTable 
                        data={teacherTableData}
                        onClick={(value) => tableTotalClickTeacher(value)}
                        selectedStartDate={teacherTabData.startDate}
                        selectedEndDate={teacherTabData.endDate}
                        />
                    </div>
                }
                {
                    activeTab===1 &&
                    <div className='m-portlet'>
                        <SubjectTable 
                        data={subjectTableData} 
                        onClick={(value) => subjectTotalClickHandler(value)}
                        selectedStartDate={subjectTabData.startDate}
                        selectedEndDate={subjectTabData.endDate}
                        />
                    </div>
                }
                {
                    activeTab===2 &&
                    <div className='m-portlet'>
                        <ClassTable 
                        data={classTableData} 
                        onClick={(value) => classTotalClickHandler(value)}
                        onClickDate={(value) => classDateClickHandler(value)}
                        selectedStartDate={classTabData.startDate}
                        selectedEndDate={classTabData.endDate}
                        />
                    </div>
                }
            </div>
            {
                showClassTotalModal &&
                <ClassTotalModal
                    onClose={closeModal}
                    title={'titleHolder'}
                    locale={locale}
                    data={classTotalData}
                    modalData = {classModalData}
                />
            }
            {
                showClassDateModal &&
                <ClassDateModal
                    onClose={closeModal}
                    title={'titleHolder'}
                    locale={locale}
                    data={classDateTableData}
                    modalData={classDateModalData}
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
        </div>
    )
}

export default attendance