# Deployment:
`docker-compose -p tos up`

# Cleanup:
`docker-compose -p tos down`

# Create a Topic in Kafka:
```bash
docker exec [kafka container name/id] kafka-topics --create --topic [topic name] --partitions 1 --replication-factor 1 --if-not-exists --zookeeper zookeeper:2181
```  
Example: 
```bash
docker exec tos_kafka_1 kafka-topics --create --topic foo --partitions 1 --replication-factor 1 --if-not-exists --zookeeper zookeeper:2181
```

# Describe a Topic in Kafka:
```bash
docker exec [kafka container name/id] kafka-topics --describe --topic [topic name] --zookeeper zookeeper:2181
```  
Example:
```bash
docker exec tos_kafka_1 kafka-topics --describe --topic foo --zookeeper zookeeper:2181
```

# Publish some data to a topic
Example:
```bash
docker exec tos_kafka_1 bash -c "seq 42 | kafka-console-producer --request-required-acks 1 --broker-list localhost:9092 --topic foo && echo 'Produced 42 messages.'"
```

# Read data in topic using consumer
```bash
docker exec tos_kafka_1 kafka-console-consumer --bootstrap-server localhost:9092 --topic foo --new-consumer --from-beginning --max-messages 42
```

# Go to bash of Schema_Registry
`docker exec -it tos_schema-registry_1 bash`

## Start sending message to topic "bar" with defined schema:
```bash
/usr/bin/kafka-avro-console-producer \
  --broker-list kafka:9092 --topic bar \
  --property value.schema='{"type":"record","name":"myrecord","fields":[{"name":"f1","type":"string"}]}'
```
Message should be something like:
```text
{"f1": "value1"}
{"f1": "value2"}
{"f1": "value3"}
```

# Create consumer instance via kafka-rest-proxy
```bash
curl -X POST -H "Content-Type: application/vnd.kafka.v1+json" \
--data '{"name": "my_consumer_instance", "format": "avro", "auto.offset.reset": "smallest"}' \
http://kafka-rest:8082/consumers/my_avro_consumer
```

# Retrieve data from a topic "bar"
```bash
curl -X GET -H "Accept: application/vnd.kafka.avro.v1+json" \
http://kafka-rest:8082/consumers/my_avro_consumer/instances/my_consumer_instance/topics/bar
```