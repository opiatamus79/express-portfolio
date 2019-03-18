function getCustomerDashInfoWith(userId, accountId){
    //need to get bill graph data/water consumption data from last 6 months
    var cumulBalQry = "SELECT SUM(amount) AS cumulative_total FROM bill WHERE user_id = $1 AND bill_status_id != 2;"
    var billQry_sixMos = "SELECT id, bill_status_id, amount, balance, date_created, due_date, date_updated FROM bill WHERE user_id = $1 AND account_id = $2 AND date_created > (CURRENT_TIMESTAMP - INTERVAL $3)\
     ORDER BY due_date ASC";
     var billQry_PrevYear = "SELECT * FROM bill WHERE user_id = $1 AND account_id = $2\
                                AND (EXTRACT(YEAR FROM due_date) = EXTRACT(YEAR FROM CURRENT_TIMESTAMP - INTERVAL '1 year') \
                                OR (EXTRACT(YEAR FROM due_date) = EXTRACT(YEAR FROM CURRENT_TIMESTAMP)\
                                AND EXTRACT(MONTH FROM due_date) = 1)) ORDER BY due_date ASC;"

     var billQry_CurrYear = "SELECT * FROM bill WHERE user_id = $1 AND account_id = $2 \
                                AND (EXTRACT(YEAR FROM due_date) = EXTRACT(YEAR FROM CURRENT_TIMESTAMP) \
                                AND EXTRACT(MONTH FROM due_date) > 1) ORDER BY due_date ASC"



    var paymentQry = "SELECT id, amount, date_created, date_updated FROM payment WHERE user_id = $1 AND date_created > (CURRENT_TIMESTAMP - INTERVAL $2)\
     ORDER BY date_created ASC";

    var promise = tx([
        query(billQry_sixMos, [userId, accountId, '6 months']), 
        query(billQry_PrevYear,[userId, accountId]),
        query(paymentQry,[userId, '6 months']),
        query(cumulBalQry,[userId]), 
        query(billQry_CurrYear,[userId, accountId])
    ])
        .then(async result => {
            // return result;
            var dashboard_result = result;
            if(result[0].length > 0) {
                var resLength = result[0].length - 1;
                var bill_graph_data = setDateForCharges(result[0]);
                const consumptionRangeData = {
                    user_id     : parseInt(userId),
                    beginMonth  : moment().subtract(6, 'month').format('MM'),
                    beginYear   : moment().subtract(6, 'month').format('YYYY'),
                    endMonth    : moment().format('MM'),
                    endYear     : moment().format('YYYY'),
                }

                var water_graph_data = {};
                console.log('Getting water consumption data', consumptionRangeData)
                water_graph_data.past_six_months = await WaterCons.getConsumptionByRange(consumptionRangeData);

                for(month in water_graph_data.past_six_months){
                    water_graph_data.past_six_months[month].month = water_graph_data.past_six_months[month].month[0] == '0' ? parseInt(water_graph_data.past_six_months[month].month.substr(-1)) - 1 : parseInt(water_graph_data.past_six_months[month].month) - 1
                }

                var curr_year = setDateForCharges(result[4]);
                var prev_year = setDateForCharges(result[1]);
                //var payments = setDateForCharges(result[2]);

                var all_graph_data = {
                    bill_graph_data: bill_graph_data,
                    waterUsage_graph_data: water_graph_data,
                    comparative_graph: {"prev_year": prev_year, "curr_year": curr_year},
                    payments : result[2]
                }
                var current_bill ={bill_id: result[0][resLength].id, amount: result[0][resLength].balance, due_date: result[0][resLength].due_date};
                var cumulative_bal = result[3][0];

                dashboard_result ={current_balance: current_bill, cumulative_balance: cumulative_bal, graph_data: all_graph_data}
            } else {
                const consumptionRangeData = {
                    user_id     : parseInt(userId),
                    beginMonth  : moment().subtract(6, 'month').format('MM'),
                    beginYear   : moment().subtract(6, 'month').format('YYYY'),
                    endMonth    : moment().format('MM'),
                    endYear     : moment().format('YYYY'),
                }

                var water_graph_data = {};
                console.log('Getting water consumption data', consumptionRangeData)
                water_graph_data.past_six_months = await WaterCons.getConsumptionByRange(consumptionRangeData);

                for(month in water_graph_data.past_six_months){
                    water_graph_data.past_six_months[month].month = water_graph_data.past_six_months[month].month[0] == '0' ? parseInt(water_graph_data.past_six_months[month].month.substr(-1)) - 1 : parseInt(water_graph_data.past_six_months[month].month) - 1
                }
                var bill_graph_data = setDateForCharges(result[0]);
                var curr_year = setDateForCharges(result[4]);
                var prev_year = setDateForCharges(result[1]);
                //var payments = setDateForCharges(result[2]);
                var all_graph_data = {
                    bill_graph_data: bill_graph_data,
                    waterUsage_graph_data: water_graph_data,
                    comparative_graph: {"prev_year": prev_year, "curr_year": curr_year},
                    payments : result[2]
                }
                var current_bill ={bill_id: null, amount: null, due_date: null}
                var cumulative_bal = result[3][0];
                dashboard_result ={current_balance: current_bill,cumulative_balance: cumulative_bal,  graph_data: all_graph_data}
            }
            return dashboard_result;
        });
        
    return promise;
}