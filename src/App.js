import './App.css';
import React, { useEffect, useState } from 'react'

function Main() {

  const tableData = [
    {
      id: 2022,
      name: 'John',
      age: 17,
      gender: 'Male'
    },
    {
      id: 2045,
      name: 'Tsenguun',
      age: 17,
      gender: 'Male'
    },
    {
      id: 324,
      name: 'Jennie',
      age: 19,
      gender: 'Female'
    },
    {
      id: 392,
      name: 'Jenifer',
      age: 18,
      gender: 'Female'
    },
    {
      id: 324,
      name: 'Jennie',
      age: 19,
      gender: 'Female'
    },
    {
      id: 392,
      name: 'Jenifer',
      age: 18,
      gender: 'Female'
    },
  ]  //data coming in from back-end
  let alteredDataHolder = tableData // initializing data which will be tampered with
  const [updateSectionShow, setUpdateSectionShow] = useState(false) //on press, the table becomes editable.
  const [addSectionShow, setAddSectionShow] = useState(false) // on press, prompts the user to add field.
  const [updatedData, setUpdatedData] = useState(tableData)
  const [addData, setAddData] = useState({id: '-', name: '-', gender: '-', age: '-'})
  const [deleteKeys, setDeleteKeys] = useState([])
  const [addDataList, setAddDataList] = useState([])
  const updateHandler = () => {
    console.log("Update request has been made")
    setUpdateSectionShow(true)
  }

  const saveHandler = () => {
    for (let i=0;i<addDataList.length;i++) {
      alteredDataHolder.push(addDataList[i])
    }
    for (let i=0;i<deleteKeys.length;i++) {
      alteredDataHolder = alteredDataHolder.filter((item, index) => index !== deleteKeys[i])
      console.log(alteredDataHolder.filter((item, index) => index !== deleteKeys[i]))
    }
    console.log("Save request has been made")
    console.log("New data to send is: ", alteredDataHolder)
    setUpdatedData([...alteredDataHolder])
    setUpdateSectionShow(false)
  }
  
  const cancelHandler = () => {
    setUpdatedData(updatedData)
    setUpdateSectionShow(false)
  }
  const deleteHandler = (key) => {
    console.log(key)
    const newArrayKey = [...deleteKeys, key]
    alteredDataHolder = updatedData.filter((item, index) => index !== key)
    setUpdatedData(alteredDataHolder)
    setDeleteKeys(newArrayKey)
    console.log(alteredDataHolder)
  }
  const addHandler = () => {
    setAddSectionShow(true)
    console.log('add')
  }
  const addDataHandler = () => {
    console.log(addData)
    alteredDataHolder.push(addData)
    updatedData.push(addData)
    const newData = [...addDataList, addData]
    setAddData({    
      id: '-',
      name: '-',
      age: '-',
      gender: '-',
    })
    setAddDataList(newData)
    setAddSectionShow(false)
  }

  const IdUpdateHandler = (event, key) => {
    const modifiedData = [...alteredDataHolder]
    modifiedData[key].id = event.target.value
  }
  const NameUpdateHandler = (event, key) => {
    const modifiedData = [...alteredDataHolder]
    modifiedData[key].name = event.target.value
  }
  const AgeUpdateHandler = (event, key) => {
    const modifiedData = [...alteredDataHolder]
    modifiedData[key].age = event.target.value
  }
  const GenderUpdateHandler = (event, key) => {
    const modifiedData = [...alteredDataHolder]
    modifiedData[key].gender = event.target.value
  }

  return (
    <div className = "Background">
      <div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <h3>
            Table Data
          </h3>
        </div>
        <div>
          { updateSectionShow === false &&
            <table>
              <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
              </tr>
              {updatedData.map((val, key) => {
                  return (
                      <tr key={key}>
                          <td>{val.id}</td>
                          <td>{val.name}</td>
                          <td>{val.age}</td>
                          <td>{val.gender}</td>
                      </tr>
                  )
              })}
              </table>
            }
            { updateSectionShow === true &&
            <table>
              <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Delete</th>
              </tr>
              {updatedData.map((val, key) => {
                  return (
                      <tr key={key}>
                          <td>
                            <input type="text" name="name" onChange = {(event) => IdUpdateHandler(event, key)} placeholder={val.id}/>
                          </td>
                          <td>
                            <input type="text" name="name" onChange = {(event) => NameUpdateHandler(event, key)} placeholder={val.name}/>
                          </td>
                          <td>
                            <input type="text" name="name" onChange = {(event) => AgeUpdateHandler(event, key)} placeholder={val.age}/>
                          </td>
                          <td>
                            <input type="text" name="name" onChange = {(event) => GenderUpdateHandler(event, key)} placeholder={val.gender}/>
                          </td>
                          <td style={{alignItems: 'center', justifyContent: 'center'}}>
                            <button className='RemoveButton' onClick={() => deleteHandler(key)}>
                              Delete
                            </button>
                          </td>
                      </tr>
                  )
              })}
              </table>
            }
        </div>
      </div>
      <div className = 'mt-1' style={{display: 'flex'}}>
        <button className = "Button" onClick={()=> updateHandler()}>
          Update
        </button>
        {
          updateSectionShow &&
          <button className = "Button ml-3" onClick={()=> cancelHandler()}>
            Cancel
          </button>
        }
        {
          updateSectionShow &&
          <button className = "Button ml-3" onClick={()=> saveHandler()}>
            Save
          </button>
        }
        {
          updateSectionShow &&
          <button className = "Button ml-3" onClick={()=> addHandler()}>
            Add
          </button>
        }
      </div>
      {addSectionShow && (
        <div className="layer-curtain">
          <div className="modal">
            <div style={{display: 'flex', justifyContent: 'center'}}>
              <h3 style={{color: 'black', alignItems: 'center'}}>Add Data</h3>
            </div>
            <div>
              <div>
                <input type="text" name="id" onChange = {(event) => setAddData({...addData, id: event.target.value})} placeholder={"Id"}/>
              </div>
              <div>
                <input type="text" name="name" onChange = {(event) => setAddData({...addData, name: event.target.value})} placeholder={"Name"}/>
              </div>
              <div>
                <input type="text" name="age" onChange = {(event) => setAddData({...addData, age: event.target.value})} placeholder={"Age"}/>
              </div>
              <div>
                <input type="text" name="gender" onChange = {(event) => setAddData({...addData, gender: event.target.value})} placeholder={"Gender"}/>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center'}}>
              <button className = 'ButtonWhite mt-1' onClick={() => addDataHandler()}>
                <h5 style={{padding: 0, margin: '0.5rem'}}>
                  Add
                </h5>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Main;
