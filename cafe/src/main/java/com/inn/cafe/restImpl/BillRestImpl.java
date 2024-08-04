package com.inn.cafe.restImpl;

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

import java.util.Map;

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
        log.info("DO I EVER GET HERE AT ALL?? 56565656");
        log.info("DO I EVER GET HERE AT ALL?? 56565656");

        log.info("DO I EVER GET HERE AT ALL?? 56565656");

        log.info("DO I EVER GET HERE AT ALL?? 56565656");

        log.info("DO I EVER GET HERE AT ALL?? 56565656");
        log.info("DO I EVER GET HERE AT ALL?? 56565656");
        log.info("DO I EVER GET HERE AT ALL?? 56565656");

        try{
            log.info("DO I EVER GET HERE AT ALL??");
            log.info("DO I EVER GET HERE AT ALL??");
            log.info("DO I EVER GET HERE AT ALL??");
            log.info("DO I EVER GET HERE AT ALL??");
            log.info("DO I EVER GET HERE AT ALL??");
            log.info("DO I EVER GET HERE AT ALL??");

            return billService.generateReport(requestMap);
        } catch (Exception ex){
            log.info("DO I EVER GET HERE AT ALL 2222222 22222??");
            ex.printStackTrace();
        }
        return CafeUtils.getResponseEntity(CafeConstants.SOMETHING_WENT_WRONG, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
