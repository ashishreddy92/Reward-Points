import React, { useState, useEffect } from "react";
import fetch from './api/dataService';
import "./App.css";
import _ from 'lodash';

const calculateResults = (incomingData) => {
  // Calculate points per transaction

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pointsPerTransaction = incomingData.map(transaction=> {
    let points = 0;
    let over100 = transaction.amt - 100;
    
    if (over100 > 0) {
      // A customer receives 2 points for every dollar spent over $100 in each transaction      
      points += (over100 * 2);
    }    
    if (transaction.amt > 50) {
      // plus 1 point for every dollar spent over $50 in each transaction
      points += 50;      
    }
    const month = new Date(transaction.transactionDt).getMonth();
    return {...transaction, points, month};
  });
               
  const byCustomer = {};
  const totalPointsByCustomer = {};
  pointsPerTransaction.forEach(pointsPerTransaction => {
    const {custid, name, month, points} = pointsPerTransaction;   
    if (!byCustomer[custid]) {
      byCustomer[custid] = [];      
    }    
    if (!totalPointsByCustomer[custid]) {
      totalPointsByCustomer[name] = 0;
    }
    totalPointsByCustomer[name] += points;
    if (byCustomer[custid][month]) {
      byCustomer[custid][month].points += points;
      byCustomer[custid][month].monthNumber = month;
      byCustomer[custid][month].numTransactions++;      
    }
    else {
      
      byCustomer[custid][month] = {
        custid,
        name,
        monthNumber:month,
        month: months[month],
        numTransactions: 1,        
        points
      }
    }    
  });
  const tot = [];
  for (var custKey in byCustomer) {    
    byCustomer[custKey].forEach(cRow=> {
      tot.push(cRow);
    });    
  }
  const totByCustomer = [];
  for (custKey in totalPointsByCustomer) {    
    totByCustomer.push({
      name: custKey,
      points: totalPointsByCustomer[custKey]
    });    
  }
  return {
    summaryByCustomer: tot,
    pointsPerTransaction,
    totalPointsByCustomer:totByCustomer
  };
}

const App = () => {
  const [transactionData, setTransactionData] = useState(null);
  const getIndividualTransactions = (index) => {
    const row = transactionData.summaryByCustomer[index];
   const result = _.filter(transactionData.pointsPerTransaction, (tRow)=>{    
      return row.custid === tRow.custid && row.monthNumber === tRow.month;
    });
    return result;
  }

  useEffect(() => { 
    fetch().then((data)=> {             
      const results = calculateResults(data);
      setTransactionData(results);
    });
  },[]);

  if (transactionData == null) {
    return <div>Loading...</div>;   
  }

  return transactionData == null ?
    <div>Loading...</div> 
      :    
    <div>      
      
      <div className="container">
        <div className="row">
          <div className="col-10">
            <h2>Points Rewards System Totals by Customer Months</h2>
          </div>
        </div>
        <div className="row">
          <div className="col-8">
           
              <table border="1">
              <thead>
              <tr>
              <th>Customer</th>
              <th>Month</th>
              <th># of Transactions</th>
              <th>Reward Points</th>
              <th>Transaction Summary</th>
              </tr>
              </thead>
              <tbody>
              {transactionData.summaryByCustomer.map((data,index) => <tr key={index}>
              <td>{data.name}</td>
              <td>{data.month}</td>
              <td>{data.numTransactions}</td>
              <td>{data.points}</td>
              <td>
                  <div>
                    
                      {getIndividualTransactions(index).map(tran=>{
                        return <div className="container">
                          <div className="row">
                            <div className="col-8">
                              <strong>Transaction Date:</strong> {tran.transactionDt} - <strong>$</strong>{tran.amt} - <strong>Points: </strong>{tran.points}
                            </div>
                          </div>
                        </div>
                      })}                                    

                  </div></td>
              </tr>)}
              </tbody>
              </table>             
            </div>
          </div>
        </div>
        
        <div className="container">    
          <div className="row">
            <div className="col-10">
              <h2>Points Rewards System Totals By Customer</h2>
            </div>
          </div>      
          <div className="row">
            <div className="col-8">
             <table>
              <thead>
              <tr>
              <th>
              Customer
              </th>
              <th>
              Points
              </th>
              </tr>
              </thead>
              <tbody>
              {transactionData.totalPointsByCustomer.map((data,index)=> <tr key={index}>
              <td>{data.name}</td>
              <td>{data.points}</td>
              </tr>)}
              </tbody>
              </table>
            </div>
          </div>
        </div>      
    </div>
  ;
}

export default App;
