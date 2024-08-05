package com.inn.cafe.restImpl;

import com.inn.cafe.POJO.Bill;
import com.inn.cafe.constants.CafeConstants;
import com.inn.cafe.rest.BillRest;
import com.inn.cafe.service.BillService;
import com.inn.cafe.utils.CafeUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

// Creates restful web service...
// Redirects the api to implement the logic here.
@RestController
public class BillRestImpl implements BillRest {
    private static final Logger log = LoggerFactory.getLogger(BillRestImpl.class);
    @Autowired
    BillService billService;
    /**
     * @param requestMap
     * @return
     */
    @Override
    public ResponseEntity<String> generateReport(Map<String, Object> requestMap) {
        try{
            return billService.generateReport(requestMap);
        } catch (Exception ex){
            ex.printStackTrace();
        }
        return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * @return
     */
    @Override
    public ResponseEntity<List<Bill>> getBills() {
        try{
            return billService.getBills();
        } catch (Exception ex){
            ex.printStackTrace();
        }
        return null;
    }
}
