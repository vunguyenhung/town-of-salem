# Create a Topic in Kafka:
##tos-user-events
docker exec tos_kafka_1 kafka-topics --create --topic tos-user-events --partitions 1 --replication-factor 1 --if-not-exists --zookeeper zookeeper:2181

##tos-invalid-events
docker exec tos_kafka_1 kafka-topics --create --topic tos-invalid-events --partitions 1 --replication-factor 1 --if-not-exists --zookeeper zookeeper:2181

#Consumer Data from a Topic
## tos-user-events
docker exec tos_kafka_1 kafka-console-consumer --bootstrap-server kafka:9092 --topic tos-user-events --new-consumer --from-beginning

## tos-invalid-events
docker exec tos_kafka_1 kafka-console-consumer --bootstrap-server kafka:9092 --topic tos-invalid-events --new-consumer --from-beginning



