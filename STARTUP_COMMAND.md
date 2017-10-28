# Create a Topic in Kafka:
## tos-some-topic
```bash
docker exec tos_kafka_1 kafka-topics --create --topic tos-some-topic --partitions 1 --replication-factor 1 --if-not-exists --zookeeper zookeeper:2181
```

## tos-lobby-events
```bash
docker exec tos_kafka_1 kafka-topics --create --topic tos-lobby-events --partitions 1 --replication-factor 1 --if-not-exists --zookeeper zookeeper:2181
```

# Consumer Data from a Topic
## tos-some-topic
```bash
docker exec tos_kafka_1 kafka-console-consumer --bootstrap-server kafka:9092 --topic tos-some-topic --new-consumer --from-beginning
```

# Publish Data to a Topic
```bash
docker exec tos_kafka_1 kafka-console-producer --request-required-acks 1 --broker-list kafka:9092 --topic tos-some-topic 
```

