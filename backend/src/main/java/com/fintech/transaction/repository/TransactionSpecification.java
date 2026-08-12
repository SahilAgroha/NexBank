package com.fintech.transaction.repository;

import com.fintech.transaction.entity.Transaction;
import com.fintech.transaction.entity.TransactionStatus;
import com.fintech.transaction.entity.TransactionType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class TransactionSpecification {

    public static Specification<Transaction> filterBy(
            LocalDateTime startDate,
            LocalDateTime endDate,
            TransactionStatus status,
            TransactionType type,
            String searchTerm
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), startDate));
            }

            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), endDate));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("type"), type));
            }

            if (StringUtils.hasText(searchTerm)) {
                String searchPattern = "%" + searchTerm.toLowerCase() + "%";
                Predicate referencePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("referenceNumber")), searchPattern);
                // Sender email search using left join
                Predicate senderEmailPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.join("senderWallet", jakarta.persistence.criteria.JoinType.LEFT)
                                .join("user", jakarta.persistence.criteria.JoinType.LEFT).get("email")), searchPattern);
                // Receiver email search using left join
                Predicate receiverEmailPredicate = criteriaBuilder.like(
                        criteriaBuilder.lower(root.join("receiverWallet", jakarta.persistence.criteria.JoinType.LEFT)
                                .join("user", jakarta.persistence.criteria.JoinType.LEFT).get("email")), searchPattern);

                predicates.add(criteriaBuilder.or(referencePredicate, senderEmailPredicate, receiverEmailPredicate));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
