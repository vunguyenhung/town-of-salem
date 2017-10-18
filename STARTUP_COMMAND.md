# Create a Topic in Kafka:
## tos-state-update-events
```bash
docker exec tos_kafka_1 kafka-topics --create --topic tos-state-update-events --partitions 1 --replication-factor 1 --if-not-exists --zookeeper zookeeper:2181
```

## tos-invalid-events
```bash
docker exec tos_kafka_1 kafka-topics --create --topic tos-invalid-events --partitions 1 --replication-factor 1 --if-not-exists --zookeeper zookeeper:2181
```

# Consumer Data from a Topic
## tos-state-update-events
```bash
docker exec tos_kafka_1 kafka-console-consumer --bootstrap-server kafka:9092 --topic tos-state-update-events --new-consumer --from-beginning
```

## tos-invalid-events
```bash
docker exec tos_kafka_1 kafka-console-consumer --bootstrap-server kafka:9092 --topic tos-invalid-events --new-consumer --from-beginning
```

# Publish Data to a Topic
```bash
docker exec tos_kafka_1 kafka-console-producer --request-required-acks 1 --broker-list kafka:9092 --topic tos-state-changes 
```

