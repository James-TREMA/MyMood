import { User } from '../../../entities/models/User';
import { Cohort } from '../../../entities/models/Cohort';
import { CohortAssignment } from '../../../entities/models/CohortAssignment';
import { MoodScore } from '../../../entities/models/MoodScore';
import { Alert } from '../../../entities/models/Alert';
import { MoodHistory } from '../../../entities/models/MoodHistory';
import { BlacklistedStudent } from '../../../entities/models/BlacklistedStudent';

describe('Entity Models', () => {
  describe('User Entity', () => {
    it('should create a valid user instance', () => {
      const user = new User();
      user.name = 'Test User';
      user.email = 'test@example.com';
      user.password = 'password123';
      user.role = 'student';

      expect(user.name).toBe('Test User');
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('student');
    });
  });

  describe('Cohort Entity', () => {
    it('should create a valid cohort instance', () => {
      const cohort = new Cohort();
      cohort.name = 'Test Cohort';
      cohort.created_by = 1;

      expect(cohort.name).toBe('Test Cohort');
      expect(cohort.created_by).toBe(1);
    });
  });

  describe('CohortAssignment Entity', () => {
    it('should create a valid assignment instance', () => {
      const assignment = new CohortAssignment();
      assignment.user_id = 1;
      assignment.cohort_id = 1;

      expect(assignment.user_id).toBe(1);
      expect(assignment.cohort_id).toBe(1);
    });
  });

  describe('MoodScore Entity', () => {
    it('should create a valid mood score instance', () => {
      const score = new MoodScore();
      score.user_id = 1;
      score.score = 75;

      expect(score.user_id).toBe(1);
      expect(score.score).toBe(75);
    });
  });

  describe('Alert Entity', () => {
    it('should create a valid alert instance', () => {
      const alert = new Alert();
      alert.user_id = 1;
      alert.supervisor_id = 2;
      alert.status = 'pending';

      expect(alert.user_id).toBe(1);
      expect(alert.supervisor_id).toBe(2);
      expect(alert.status).toBe('pending');
    });
  });

  describe('MoodHistory Entity', () => {
    it('should create a valid mood history instance', () => {
      const history = new MoodHistory();
      history.user_id = 1;
      history.previous_score = 80;
      history.new_score = 75;

      expect(history.user_id).toBe(1);
      expect(history.previous_score).toBe(80);
      expect(history.new_score).toBe(75);
    });
  });

  describe('BlacklistedStudent Entity', () => {
    it('should create a valid blacklisted student instance', () => {
      const blacklisted = new BlacklistedStudent();
      blacklisted.student_id = 1;
      blacklisted.cohort_id = 1;

      expect(blacklisted.student_id).toBe(1);
      expect(blacklisted.cohort_id).toBe(1);
    });
  });
});