import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {programService, Program, getWorkoutTypeInfo} from '../services/api';
import {RootStackParamList} from '../navigation/AppNavigator';

type ProgramDetailRouteProp = RouteProp<RootStackParamList, 'ProgramDetail'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const ProgramDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ProgramDetailRouteProp>();
  const {programId} = route.params;
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgram();
  }, [programId]);

  const loadProgram = async () => {
    try {
      setLoading(true);
      const data = await programService.getProgramById(programId);
      setProgram(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load workout details');
      console.error('Error loading program:', error);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer} edges={['top']}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading workout...</Text>
      </SafeAreaView>
    );
  }

  if (!program) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('WorkoutBuilder', {programId})}
        >
          <Icon name="edit" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Program Header */}
        <View style={styles.programHeader}>
          <Text style={styles.programTitle}>{program.title}</Text>
          <View style={styles.programMeta}>
            <View style={styles.metaBadge}>
              <Icon name="calendar-today" size={16} color="#007AFF" />
              <Text style={styles.metaText}>{program.totalWeeks} weeks</Text>
            </View>
            <View style={styles.metaBadge}>
              <Icon name="view-list" size={16} color="#007AFF" />
              <Text style={styles.metaText}>{program.sessions?.length || 0} sessions</Text>
            </View>
          </View>
        </View>

        {/* Sessions */}
        {program.sessions && program.sessions.length > 0 ? (
          <View style={styles.sessionsSection}>
            <Text style={styles.sectionTitle}>Sessions</Text>
            {program.sessions.map((session, sessionIndex) => (
              <View key={session.id || sessionIndex} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View style={styles.sessionNumber}>
                    <Text style={styles.sessionNumberText}>{sessionIndex + 1}</Text>
                  </View>
                  <Text style={styles.sessionTitle}>{session.title}</Text>
                </View>

                {/* Blocks */}
                {session.blocks && session.blocks.length > 0 ? (
                  <View style={styles.blocksSection}>
                    {session.blocks.map((block, blockIndex) => {
                      const workoutTypeInfo = block.workoutType
                        ? getWorkoutTypeInfo(block.workoutType)
                        : null;

                      return (
                        <View key={blockIndex} style={styles.blockCard}>
                          <View style={styles.blockHeader}>
                            <Text style={styles.blockLabel}>{block.label}</Text>
                            {workoutTypeInfo && (
                              <View
                                style={[
                                  styles.workoutTypeBadge,
                                  {backgroundColor: workoutTypeInfo.color + '20'},
                                ]}
                              >
                                <Icon
                                  name={workoutTypeInfo.icon}
                                  size={14}
                                  color={workoutTypeInfo.color}
                                />
                                <Text
                                  style={[
                                    styles.workoutTypeText,
                                    {color: workoutTypeInfo.color},
                                  ]}
                                >
                                  {workoutTypeInfo.displayName}
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Block Config */}
                          {(block.restBetweenItemsSeconds ||
                            block.restAfterBlockSeconds ||
                            block.totalRounds ||
                            block.amrapDurationSeconds) && (
                            <View style={styles.blockConfig}>
                              {block.restBetweenItemsSeconds && (
                                <View style={styles.configItem}>
                                  <Icon name="timer" size={14} color="#666" />
                                  <Text style={styles.configText}>
                                    Rest between: {block.restBetweenItemsSeconds}s
                                  </Text>
                                </View>
                              )}
                              {block.restAfterBlockSeconds && (
                                <View style={styles.configItem}>
                                  <Icon name="timer-off" size={14} color="#666" />
                                  <Text style={styles.configText}>
                                    Rest after: {block.restAfterBlockSeconds}s
                                  </Text>
                                </View>
                              )}
                              {block.totalRounds && (
                                <View style={styles.configItem}>
                                  <Icon name="repeat" size={14} color="#666" />
                                  <Text style={styles.configText}>
                                    {block.totalRounds} rounds
                                  </Text>
                                </View>
                              )}
                              {block.amrapDurationSeconds && (
                                <View style={styles.configItem}>
                                  <Icon name="timer" size={14} color="#666" />
                                  <Text style={styles.configText}>
                                    AMRAP: {block.amrapDurationSeconds}s
                                  </Text>
                                </View>
                              )}
                            </View>
                          )}

                          {/* Exercises */}
                          {block.items && block.items.length > 0 ? (
                            <View style={styles.exercisesList}>
                              {block.items.map((item, itemIndex) => (
                                <View key={item.id || itemIndex} style={styles.exerciseItem}>
                                  <View style={styles.exerciseHeader}>
                                    <View style={styles.exerciseIcon}>
                                      <Icon name="fitness-center" size={16} color="#007AFF" />
                                    </View>
                                    <Text style={styles.exerciseName}>
                                      {item.exerciseName}
                                    </Text>
                                  </View>

                                  {/* Prescription */}
                                  {item.prescription && (
                                    <View style={styles.prescription}>
                                      {item.prescription.sets && (
                                        <Text style={styles.prescriptionText}>
                                          {item.prescription.sets} sets
                                        </Text>
                                      )}
                                      {item.prescription.targetReps && (
                                        <Text style={styles.prescriptionText}>
                                          • {item.prescription.targetReps} reps
                                        </Text>
                                      )}
                                      {item.prescription.minReps &&
                                        item.prescription.maxReps && (
                                          <Text style={styles.prescriptionText}>
                                            • {item.prescription.minReps}-
                                            {item.prescription.maxReps} reps
                                          </Text>
                                        )}
                                      {item.prescription.weight && (
                                        <Text style={styles.prescriptionText}>
                                          • {item.prescription.weight}
                                          {item.prescription.weightUnit || 'kg'}
                                        </Text>
                                      )}
                                      {item.prescription.restSeconds && (
                                        <Text style={styles.prescriptionText}>
                                          • {item.prescription.restSeconds}s rest
                                        </Text>
                                      )}
                                      {item.prescription.rpe && (
                                        <Text style={styles.prescriptionText}>
                                          • RPE {item.prescription.rpe}
                                        </Text>
                                      )}
                                      {item.prescription.tempo && (
                                        <Text style={styles.prescriptionText}>
                                          • Tempo: {item.prescription.tempo}
                                        </Text>
                                      )}
                                    </View>
                                  )}
                                </View>
                              ))}
                            </View>
                          ) : (
                            <Text style={styles.noExercisesText}>No exercises added</Text>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.noBlocksText}>No blocks added to this session</Text>
                )}

                {/* Start Workout Button */}
                <TouchableOpacity
                  style={styles.startWorkoutButton}
                  onPress={() => {
                    // For now, use a hardcoded userId. In production, get from auth context
                    const userId = '00000000-0000-0000-0000-000000000001';
                    navigation.navigate('WorkoutExecution', {
                      session,
                      userId,
                    });
                  }}
                >
                  <Icon name="play-arrow" size={20} color="white" />
                  <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="fitness-center" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No sessions in this workout</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  editButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  programHeader: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  programTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  programMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  sessionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  sessionCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sessionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  blocksSection: {
    gap: 12,
  },
  blockCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  blockLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  workoutTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  workoutTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  blockConfig: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  configText: {
    fontSize: 12,
    color: '#666',
  },
  exercisesList: {
    gap: 8,
  },
  exerciseItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  exerciseIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  prescription: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginLeft: 38,
  },
  prescriptionText: {
    fontSize: 13,
    color: '#666',
  },
  noExercisesText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  noBlocksText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  startWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  startWorkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProgramDetailScreen;
