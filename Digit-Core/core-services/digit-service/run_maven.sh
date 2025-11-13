#!/bin/bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH=$JAVA_HOME/bin:$PATH
export MAVEN_OPTS="-Djava.home=$JAVA_HOME"
mvn "$@"
