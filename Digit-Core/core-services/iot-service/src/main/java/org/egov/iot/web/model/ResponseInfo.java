package org.egov.iot.web.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponseInfo {

    @JsonProperty("apiId")
    private String apiId;

    @JsonProperty("ver")
    private String ver;

    @JsonProperty("ts")
    private Long ts;

    @JsonProperty("resMsgId")
    private String resMsgId;

    @JsonProperty("msgId")
    private String msgId;

    @JsonProperty("status")
    private String status;

    public static ResponseInfo success() {
        return ResponseInfo.builder()
                .status("successful")
                .ts(System.currentTimeMillis())
                .build();
    }

    public static ResponseInfo error() {
        return ResponseInfo.builder()
                .status("failed")
                .ts(System.currentTimeMillis())
                .build();
    }
}
