package com.inn.cafe.serviceImpl;

import com.inn.cafe.JWT.JwtFilter;
import com.inn.cafe.POJO.Bill;
import com.inn.cafe.constants.CafeConstants;
import com.inn.cafe.service.BillService;
import com.inn.cafe.utils.CafeUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@Service
public class BillServiceImpl implements BillService {
    @Autowired
    JwtFilter jwtFilter;
    /**
     * @param requestMap
     * @return
     */
    @Override
    public ResponseEntity<String> generateReport(Map<String, Object> requestMap) {
        log.info("INSIDE GENERATE REPORT");
        try {
            // validate the sequence
            // Generate filename to uniquely identify any pdf
            String fileName;
            if (validateRequestMap(requestMap)){
                if(requestMap.containsKey("isGenerate") && !(Boolean) requestMap.get("isGenerate")){
                    //If the data is already in the database, pass the uuid
                    // from the request map.
                    // It also passes value from isGenerate into the filename
                    fileName = (String) requestMap.get("uuid");
                } else {
                    // Generate a unique name / id
                    fileName = CafeUtils.getUUID();
                    requestMap.put("uuid", fileName);
                    insertBill(requestMap);
                }
            } else {
                return CafeUtils.getResponseEntity("Required data not found.", HttpStatus.BAD_REQUEST);
            }

        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private void insertBill(Map<String, Object> requestMap) {
        try {
            Bill bill = new Bill();
            bill.setUuid((String) requestMap.get("uuid"));
            bill.setName((String)requestMap.get("name"));
            bill.setEmail((String)requestMap.get("email"));
            bill.setContactNumber((String)requestMap.get("contactNumber"));
            bill.setPaymentMethod((String)requestMap.get("paymentMethod"));
            bill.setTotal(Integer.parseInt((String) requestMap.get("totalAmount")));
            bill.setProductDetails((String) requestMap.get("productDetails"));
            bill.setCreatedBy(jwtFilter.getCurrentUser());

        } catch (Exception ex){
            ex.printStackTrace();
        }
    }

    private boolean validateRequestMap(Map<String, Object> requestMap) {
        return requestMap.containsKey("name")&&
                requestMap.containsKey("contactNumber") &&
                requestMap.containsKey("email") &&
                requestMap.containsKey("paymentMethod") &&
                requestMap.containsKey("productDetails") &&
                requestMap.containsKey("totalAmount");
    }
}
