@GetMapping(path="getTasks")
@ResponseBody
Public TaskQueryResponse getTasks(@Request Param(required=False) collection<String>
Producercodes,
@Request Param(required=False) collection<String> dacGroupsIds,
@Request Param(required=False) collection<String> userIds,
@Request Param(required=False) collection<String> earliestStopDate,
@Request Param(required=False) collection<String> latestStopDates
)
throws TaskQueryServiceException {
TaskQueryResponse retResult = new TaskQueryResponse();
retResult.getTasks().addAll(taskQuerySvc.queryAnalyticsReqs(producerCodes, dacGroupsIds, userIds, earliestStopDate, latestStopDates)

for (TaskModel task: retes
}