package com.unicore.dto;

import com.unicore.model.Ticket.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketRequestDTO {
    private Long resourceId;
    @NotBlank(message = "Location is required")
    @Size(max = 120, message = "Location must be 120 characters or fewer")
    private String location;
    @NotBlank(message = "Ticket category is required")
    private String category;
    @NotBlank(message = "Description is required")
    @Size(min = 10, message = "Description must be at least 10 characters long")
    private String description;
    @NotNull(message = "Priority is required")
    private Priority priority;
    @Size(max = 120, message = "Contact details must be 120 characters or fewer")
    private String contactDetails;
}
