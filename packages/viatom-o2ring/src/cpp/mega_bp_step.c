#include "mega_bp_step.h"
#ifndef typedef_b_struct_T
#define typedef_b_struct_T

typedef struct {
  float l1;
  float l2;
  float p1;
  float p2;
} b_struct_T;

#endif

#ifndef typedef_c_struct_T
#define typedef_c_struct_T

typedef struct {
  float kor1;
  float par3;
} c_struct_T;

#endif

#ifndef typedef_d_struct_T
#define typedef_d_struct_T

typedef struct {
  b_struct_T tr_fi;
  c_struct_T hef;
} d_struct_T;

#endif

#ifndef typedef_struct_T
#define typedef_struct_T

typedef struct {
  float rl_ff;
} struct_T;

#endif

#ifndef typedef_e_struct_T
#define typedef_e_struct_T

typedef struct {
  struct_T pre_filter;
  d_struct_T freq_tracking;
} e_struct_T;

#endif

#ifndef typedef_f_struct_T
#define typedef_f_struct_T

typedef struct {
  float memory;
  float b1;
  float b2;
} f_struct_T;

#endif

#ifndef typedef_g_struct_T
#define typedef_g_struct_T

typedef struct {
  float f1;
  float f2;
  float pad1;
  float chi2;
  float zek;
  float fs;
  f_struct_T tr_fi;
  float init_f;
} g_struct_T;

#endif

#ifndef typedef_h_struct_T
#define typedef_h_struct_T

typedef struct {
  float beta;
} h_struct_T;

#endif

#define b_acc_run_flag                 (false)
#define b_SNR                          (0.0F)

static boolean_T bpt_not_empty;
static boolean_T mega_bp_rst_s;
static boolean_T mega_bp_rst_h;
static unsigned char bp_prev;
static float b_bpf_s[5];
static float a_bpf_s[5];
static float b_bpf_s2[5];
static float a_bpf_s2[5];
static float b_bpf_s3[5];
static float a_bpf_s3[5];
static float b_bpf_n[5];
static float a_bpf_n[5];
static float ppg_sig_buff[50];
static float ppg_noise_buff[50];
static float buff_ind;
static boolean_T buff_first_time_flag;
static unsigned char tot_cnt;
static float bp_new_prev;
static unsigned char debounce_peaks;
static unsigned char acc_std_cnt;
static unsigned char switch_bp_cnt;
static float high_acc_std_cnt;
static unsigned char new_init_bp;
static boolean_T first_time_bp_p;
static boolean_T reset_flag_peaks;
static unsigned char debounce_he_peaks;
static unsigned char debounce_he_peaks2;
static float bp_peaks_prev;
static float snr_fft_new_prev;
static unsigned char sbp_calib_p;
static unsigned char dbp_calib_p;
static boolean_T first_time_bp;
static unsigned char first_bp_val;
static float ppg_buff_clean[100];
static float ppg_buff_orig[100];
static unsigned char ppg_buff_ind;
static boolean_T bp_init_reset_flag;
static double ham_win[100];
static double b_ppg[5];
static double a_ppg[5];
static boolean_T first_time_buff_full;
static boolean_T first_time_buff_full_05;
static boolean_T reset_flag_bad_snr;
static float bad_snr_flag_sum;
static float bad_snr_flag_count;
static float change_bp_cnt;
static unsigned char samp_rate_cnt;
static unsigned char sbp_out_prev;
static unsigned char dbp_out_prev;
static float cnt_tot;
static float z[5];
static boolean_T z_not_empty;
static float b_z[5];
static boolean_T b_z_not_empty;
static float c_z[5];
static boolean_T c_z_not_empty;
static float d_z[5];
static boolean_T d_z_not_empty;
static float e_z[5];
static boolean_T e_z_not_empty;
static float f_z[5];
static boolean_T f_z_not_empty;
static float ppg_buff[50];
static boolean_T ppg_buff_not_empty;
static float ppg_buff2[50];
static unsigned char b_ppg_buff_ind;
static unsigned char b_tot_cnt;
static float cnt_1;
static boolean_T cnt_1_not_empty;
static float cnt_0;
static signed char bad_snr_flag_prev;
static boolean_T first_time_cnt1;
static boolean_T first_time_cnt0;
static unsigned int method;
static unsigned int state;
static unsigned int b_state[2];
static unsigned int c_state[625];
static boolean_T state_not_empty;
static boolean_T t_r_f;
static boolean_T t_r_f_not_empty;
static unsigned char cd_har_test;
static boolean_T lock_harm_flag;
static unsigned char bp_kodem;
static boolean_T new_init_bp_static;
static float saturation_cnt;
static unsigned char saved_bp;
static float vect_ted_act[64];
static float vect_ted_men[64];
static float vect_pleth_makor[64];
static float vect_act_makor[192];
static boolean_T acc_run_flag;
static float SNR;
static e_struct_T mega_bp_params;
static float sig_res_1[10];
static float pop1;
static boolean_T pop1_not_empty;
static float sig_res_2[10];
static unsigned short gcpf;
static float ppg_vec2[3];
static float acc_vec2[9];
static boolean_T noc_not_empty;
static float ppg_vec1[2];
static float acc_vec1[6];
static float ppg_f_v;
static boolean_T ppg_f_v_not_empty;
static float acc_f_v[3];
static float b_bp_kodem;
static float theta2;
static float taf;
static float vector_d[2];
static float vector_1_1[2];
static float kefel[2];
static float mehir[2];
static float pad1;
static float zavit;
static float HBS;
static float del1;
static float hal_d;
static unsigned char rftd;
static boolean_T rftd_not_empty;
static float vector1[5];
static float vector2[4];
static float tg;
static float Pold;
static float shev_up;
static boolean_T shev_up_not_empty;
static float shev_dwn;
static float vec_2_b[3];
static float vec_2_a[2];
static float trig_zav;
static unsigned short counter;
static unsigned short mem;
static boolean_T mem_not_empty;
static unsigned char fft_index;
static boolean_T fft_index_not_empty;
static unsigned short rst_index;
static unsigned char ppg_buff_first_loop_flag;
static unsigned char original_ppg_buff_ind;
static boolean_T inner_reset;
static boolean_T inner_reset_not_empty;
static float init_freq_test;
static unsigned char bp_init_bin;
static float vectors_to_use[128];
static unsigned char tot_count;
static float act_level;
static boolean_T InitDone;
static unsigned short b_rst_index;
static boolean_T IsActiveFlag;
static boolean_T flg_check_harm_5;
static boolean_T non_sat_flag;
static unsigned char peaks_time_domain_flag;
static unsigned char peaks_time_domain_flag2;
static unsigned char peaks_time_domain_flag_acc;
static unsigned char no_bp_found_counter;
static float can_val_buff[20];
static unsigned char can_val_buff_ind;
static float gap_prev1;
static boolean_T gap_prev1_not_empty;
static float gap_prev2;
static float gap_prev3;
static float gap_prev4;
static unsigned short g_c_y;
static short s_h_c_1;
static short s_h_c_l_1;
static short s_l_c_l_1;
static short s_l_c_1;
static float LastRechesGova;
static unsigned char bp_save;
static float internal_counter;
static float B_M_Y[361];
static float nun_f;
static float kl[19];
static boolean_T kl_not_empty;
static float tmp;
static float feat_vec[19];
static boolean_T noise_flag;
static boolean_T noise_flag_not_empty;
static unsigned char harm_cnt_ok;
static boolean_T harm_cnt_ok_not_empty;
static void acc_analysis(unsigned char blood_preesure, float *out_std, float
  c_SNR, boolean_T reset_flag);
static void b_fft4plot(const float sig[50], float Y[129]);
static unsigned short b_mod(unsigned short x, unsigned short y);
static double b_rand(void);
static float b_rdivide(double x, float y);
static float b_std(const float varargin_1[50]);
static double b_sum(const double x[10]);
static void bp_algo(const int data_in[4], float original_ppg, const float
                    original_acc[3], float c_input_params_struct_pre_filte,
                    float d_input_params_struct_pre_filte, float
                    e_input_params_struct_pre_filte, float
                    f_input_params_struct_pre_filte, float
                    g_input_params_struct_pre_filte, float
                    h_input_params_struct_pre_filte, float
                    i_input_params_struct_pre_filte, g_struct_T
                    c_input_params_struct_freq_trac, const h_struct_T
                    input_params_struct_snr_params, float
                    c_input_params_struct_max_reset, boolean_T
                    input_params_struct_r_f_h_h, boolean_T
                    input_params_struct_r_f_h_s, unsigned char b_new_init_bp,
                    boolean_T b_bp_init_reset_flag, unsigned char
                    *blood_preesure, unsigned char *blood_preesure_raw, float
                    *ppg_clean, float *snr, float *activity_type, float
                    *acc_recursive_std, float *ppg_recursive_std, float ppg_fft
                    [18], boolean_T *bp_from_fft_flag, boolean_T *sat_flag_out);
static float bpf_noise(float b[5], float a[5], float x, boolean_T reset);
static float bpf_sig(float b[5], float a[5], float x, boolean_T reset);
static float bpf_sig2(float b[5], float a[5], float x, boolean_T reset);
static float bpf_sig3(float b[5], float a[5], float x, boolean_T reset);
static float bpf_sig4(double b[5], double a[5], float x, boolean_T reset);
static float bpf_sig5(double b[5], double a[5], float x, boolean_T reset);
static void c_fft4plot(const float sig[100], float Y[129]);
static float c_mod(float x, float y);
static float c_std(const float varargin_1[100]);
static void calc_bp_p(float ppg, float ppg2, boolean_T reset_flag, float
                      *bp_peaks_out_1, float *S, float ppg_buff_out[50]);
static void cont_bp_calc(float ppg_clean, float activity_type, boolean_T
  reset_flag, float c_input_params_struct_freq_trac, float
  d_input_params_struct_freq_trac, float e_input_params_struct_freq_trac, float
  f_input_params_struct_freq_trac, float g_input_params_struct_freq_trac, float
  h_input_params_struct_freq_trac, float i_input_params_struct_freq_trac, float
  j_input_params_struct_freq_trac, float k_input_params_struct_freq_trac, float
  l_input_params_struct_freq_trac, float c_input_params_struct_snr_param, float *
  freq, float *snr, float *bpf_s);
static signed char debounce_bad_snr_flag(boolean_T bad_snr_flag, float
  snr_fft_new, boolean_T reset_flag);
static void eml_rand_init(void);
static void eml_rand_mcg16807_stateful_init(void);
static double eml_rand_mt19937ar(unsigned int d_state[625]);
static void eml_rand_shr3cong_stateful_init(void);
static void fft4plot(const float sig[64], float Y[129]);
static void filter(double b[5], double a[5], const double x[88], const double
                   zi[4], double y[88]);
static void filtfilt(const double x_in[64], double y_out[64]);
static void first_bp_calc(unsigned char b_fft_index, unsigned char
  b_original_ppg_buff_ind, unsigned char b_ppg_buff_first_loop_flag, float
  original_ppg, float activity_type, float max_reset_time, boolean_T
  reset_flag_hard, boolean_T reset_flag_soft, boolean_T har_val_flag, boolean_T
  b_bp_init_reset_flag, float *first_BP, boolean_T *first_bp_flag, float
  ppg_fft_nonmean1[18], boolean_T *dont_overide_bp);
static void fpeaks(const float x_in[64], unsigned char ind_start, unsigned char
                   ind_end, unsigned char mode, unsigned char mask_max2[10],
                   unsigned char *Counter_max2);
static void fpeaks2(const float x_in[50], unsigned char ind_end, unsigned char
                    mask_max2[10], unsigned char *Counter_max2, float peaks_dc
                    [10]);
static void freq_analysis_raz(float x[128]);
static void init_filtering(const float in[4], float
  c_input_params_struct_pre_filte, float d_input_params_struct_pre_filte, float
  e_input_params_struct_pre_filte, float f_input_params_struct_pre_filte, float
  g_input_params_struct_pre_filte, float h_input_params_struct_pre_filte, float
  i_input_params_struct_pre_filte, boolean_T input_params_struct_r_f_h_h, float *
  ppg_clean, float *ppg_bpf, float *acc_recursive_std, float *ppg_recursive_std,
  float *ppg, float *pleth_lif_mar, float *sheerit_mar);
static void is_legal_bp_peaks(unsigned char Peaks_ppg[10], unsigned char
  num_peaks_ppg, float b_act_level, unsigned char b_original_ppg_buff_ind,
  boolean_T reset_flag, float *BP_out, float *mega_var);
static float mean(const float x[64]);
static float rdivide(float x, float y);
static double rt_roundd(double u);
static void set_initial_parameters(boolean_T reset_flag, float
  *bp_algo_params_pre_filter_f_l, float c_bp_algo_params_pre_filter_acc[3],
  float *bp_algo_params_pre_filter_conf, float *c_bp_algo_params_pre_filter_ag_,
  float *d_bp_algo_params_pre_filter_ag_, float *e_bp_algo_params_pre_filter_ag_,
  float *f_bp_algo_params_pre_filter_ag_, float *g_bp_algo_params_pre_filter_ag_,
  float *h_bp_algo_params_pre_filter_ag_, g_struct_T
  *bp_algo_params_freq_tracking, h_struct_T *bp_algo_params_snr_params, float
  *bp_algo_params_max_reset_time, boolean_T *bp_algo_params_r_f_h_h, boolean_T
  *bp_algo_params_r_f_h_s);
static void sum(const float x[192], float y[64]);
static void trk_3(const float bw[2], float *num, float den[4]);
static void twister_state_vector(unsigned int mt[625], double seed);
static void acc_analysis(unsigned char blood_preesure, float *out_std, float
  c_SNR, boolean_T reset_flag)
{
  int t_o_d_1;
  int t_o_u_1;
  int curr_flag;
  boolean_T tn1;
  boolean_T tn2;
  boolean_T tn3;
  boolean_T tn4;
  boolean_T tn5;
  boolean_T tn6;
  boolean_T tn7;
  boolean_T tn8;
  float mega_mean;
  if ((!gap_prev1_not_empty) || reset_flag) {
    gap_prev1 = 0.0F;
    gap_prev1_not_empty = true;
    gap_prev2 = 0.0F;
    gap_prev3 = 0.0F;
    gap_prev4 = 0.0F;
    g_c_y = 0;
    s_h_c_1 = 1;
    s_h_c_l_1 = 1;
    s_l_c_l_1 = 1;
    s_l_c_1 = 1;
    LastRechesGova = 0.0F;
    memset(&can_val_buff[0], 0, 20U * sizeof(float));
    can_val_buff_ind = 0;
    bp_save = 0;
    internal_counter = 1000.0F;
  }

  internal_counter++;
  if (internal_counter > 1000.0F) {
    internal_counter = 1000.0F;
  }

  if (c_SNR < 3.0F) {
    t_o_d_1 = 470;
    t_o_u_1 = 250;
  } else {
    t_o_d_1 = 400;
    t_o_u_1 = 180;
  }

  g_c_y++;
  curr_flag = 0;
  if (g_c_y == 15) {
    gap_prev1 = *out_std;
  } else if (g_c_y == 30) {
    gap_prev2 = *out_std;
  } else if (g_c_y == 45) {
    gap_prev3 = *out_std;
  } else if (g_c_y == 60) {
    gap_prev4 = *out_std;
  } else {
    if (!(b_mod(g_c_y, 15) != 0)) {
      tn1 = (*out_std > gap_prev4);
      tn2 = (gap_prev4 > gap_prev3);
      tn3 = (gap_prev3 > gap_prev2);
      tn4 = (gap_prev2 > gap_prev1);
      tn5 = (*out_std < gap_prev4);
      tn6 = (gap_prev4 < gap_prev3);
      tn7 = (gap_prev3 < gap_prev2);
      tn8 = (gap_prev2 < gap_prev1);
      mega_mean = ((((*out_std + gap_prev4) + gap_prev3) + gap_prev2) +
                   gap_prev1) / 5.0F;
      if ((tn1 && tn2 && tn3 && tn4 && (*out_std > 400.0F) && (*out_std -
            gap_prev2 > 100.0F) && (*out_std - gap_prev2 > 2.0F * gap_prev2) &&
           (gap_prev2 > 0.005F) && (gap_prev1 > 0.005F)) || (tn1 && tn2 && tn3 &&
           (*out_std > 350.005249F) && (*out_std - gap_prev2 > 33.3333321F) &&
           (gap_prev2 < 200.0F) && (*out_std - gap_prev2 > 2.0F * gap_prev2) &&
           (gap_prev2 > 0.005F) && (gap_prev1 > 0.005F) && (*out_std > gap_prev1))
          || ((((tn1 + tn2) + tn3) + tn4 > 3) && (((*out_std > 100.0F) &&
             (gap_prev1 < 1.0F)) || ((gap_prev1 < 900.009033F) && (*out_std -
              gap_prev1 > 250.0F))) && (*out_std / gap_prev1 > 2.0F) &&
              (gap_prev2 > 0.005F) && (gap_prev1 > 0.005F)) || ((*out_std >
            20.0F) && (gap_prev4 > 10.0F) && (gap_prev3 < 1.0F) && (gap_prev2 <
            1.0F) && (gap_prev1 < 1.0F) && (gap_prev2 > 0.005F) && (gap_prev1 >
            0.005F)) || ((*out_std > 50.0F) && (gap_prev4 < 4.0F) && (gap_prev3 <
            4.0F) && (gap_prev2 < 4.0F) && (gap_prev1 < 4.0F) && (gap_prev2 >
            0.1F) && (gap_prev1 > 0.1F)) || (tn1 && tn2 && (gap_prev2 < 5.0F) &&
           (gap_prev1 < 5.0F) && (*out_std - gap_prev4 > 2.0F) && (gap_prev4 -
            gap_prev3 > 2.0F) && (gap_prev2 > 0.005F) && (gap_prev1 > 0.005F) &&
           (*out_std > 25.0F)) || ((*out_std > 10.0F) && (gap_prev4 > 8.0F) &&
           (gap_prev3 < 0.1F) && (gap_prev2 < 0.1F) && (gap_prev1 < 0.1F)) || ((*
            out_std > 2000.0F) && (gap_prev4 < 500.0F) && (gap_prev3 < 500.0F) &&
           (gap_prev2 < 20.0F) && (gap_prev1 < 1.0F)) || ((*out_std > 200.0F) &&
           (gap_prev4 < 5.0F) && (gap_prev3 < 1.0F) && (gap_prev2 < 1.0F) &&
           (gap_prev1 < 0.5F)) || ((*out_std > 500.0F) && (gap_prev4 <
            149.999252F) && (gap_prev3 < 100.0F) && (gap_prev2 < 100.0F) &&
           (gap_prev1 < 100.0F)) || ((*out_std > 900.009033F) && (gap_prev4 <
            250.0F) && (gap_prev3 < 250.0F) && (gap_prev2 < 250.0F) &&
           (gap_prev1 < 250.0F)) || ((*out_std > 350.005249F) && (gap_prev4 <
            100.0F) && (gap_prev3 < 80.0F) && (gap_prev2 < 5.0F) && (gap_prev1 <
            1.0F)) || ((*out_std > 200.0F) && (gap_prev4 < 50.0F) && (gap_prev3 <
            33.3333321F) && (gap_prev2 < 33.3333321F) && (gap_prev1 <
            33.3333321F)) || ((*out_std > 50.0F) && (gap_prev4 > 50.0F) &&
                              (gap_prev3 > 50.0F) && (gap_prev2 < 33.3333321F) &&
           (gap_prev1 < 10.0F)) || ((*out_std > 500.0F) && (gap_prev4 <
            450.004517F) && (gap_prev3 < 90.0000916F) && (gap_prev2 <
            90.0000916F) && (gap_prev1 < 5.0F))) {
        if ((*out_std > 130.000137F) || ((*out_std > 100.0F) && (gap_prev4 <
              5.0F) && (gap_prev3 < 0.1F) && (gap_prev2 < 0.1F) && (gap_prev1 <
              0.1F)) || ((*out_std > 50.0F) && (gap_prev4 > 50.0F) && (gap_prev3
              > 50.0F) && (gap_prev2 < 33.3333321F) && (gap_prev1 < 10.0F))) {
          s_h_c_1 = (short)t_o_u_1;
          s_l_c_1 = 1;
          s_h_c_l_1 = 1;
          s_l_c_l_1 = 1;
        } else {
          s_h_c_l_1 = (short)t_o_u_1;
          s_l_c_l_1 = 1;
          s_l_c_1 = 1;
          s_h_c_1 = 1;
        }

        bp_save = blood_preesure;
        internal_counter = 0.0F;
        LastRechesGova = *out_std;
        curr_flag = 1;
      }

      if (((tn5 && tn6 && tn7 && (gap_prev1 > 400.0F) && (*out_std < 149.999252F)
            && (gap_prev2 - *out_std > 100.0F)) || (tn5 && tn6 && tn7 &&
            (gap_prev1 > 1399.97205F) && (*out_std < 300.003F) && (gap_prev2 -
             *out_std > 100.0F)) || ((((tn5 + tn6) + tn7) + tn8 >= 2) &&
            (gap_prev1 > 179.99855F) && (*out_std < 300.003F) && (gap_prev2 -
             *out_std > 100.0F) && (gap_prev4 < gap_prev1) && (((gap_prev3 >
               20.0F) + (gap_prev4 > 20.0F)) + (*out_std > 20.0F) < 3)) ||
           ((((tn5 + tn6) + tn7) + tn8 == 4) && (gap_prev1 > 3000.3F) &&
            (*out_std < 1000.0F) && (gap_prev2 - *out_std > 100.0F)) ||
           (((((gap_prev4 > *out_std) + (gap_prev3 > *out_std)) + (gap_prev2 >
               *out_std)) + (gap_prev1 > *out_std) >= 3) && ((gap_prev4 -
              *out_std) * 2.0F < gap_prev1 - *out_std) && (*out_std < 20.0F) &&
            (((((gap_prev4 > 59.9998779F) + (gap_prev3 > 59.9998779F)) +
               (gap_prev2 > 59.9998779F)) + (gap_prev1 > 59.9998779F) >= 2) ||
             (((((*out_std < 20.0F) + (gap_prev4 < 20.0F)) + (gap_prev3 < 20.0F))
               + (gap_prev2 < 20.0F) >= 2) && (((gap_prev3 > 20.0F) + (gap_prev2
                 > 20.0F)) + (gap_prev1 > 20.0F) >= 2))) && (gap_prev1 >
             350.005249F) && (gap_prev1 - *out_std > gap_prev2 - *out_std) &&
            (gap_prev1 - *out_std > gap_prev3 - *out_std) && (gap_prev1 -
             *out_std > gap_prev4 - *out_std) && ((((((*out_std - mega_mean) * (*
                  out_std - mega_mean) + (gap_prev4 - mega_mean) * (gap_prev4 -
                  mega_mean)) + (gap_prev3 - mega_mean) * (gap_prev3 - mega_mean))
               + (gap_prev2 - mega_mean) * (gap_prev2 - mega_mean)) + (gap_prev1
               - mega_mean) * (gap_prev1 - mega_mean)) / 4.0F > 1.5E+6F)) ||
           ((gap_prev1 > 599.988F) && (gap_prev2 < 149.999252F) && (gap_prev3 <
             100.0F) && (gap_prev4 < 100.0F) && (*out_std < 100.0F)) ||
           ((gap_prev1 > 200.0F) && (gap_prev2 < 100.0F) && (gap_prev3 < 100.0F)
            && (gap_prev4 < 5.0F) && (*out_std < 2.0F)) || ((((tn5 + tn6) + tn7)
             + tn8 >= 2) && (*out_std < 200.0F) && (gap_prev4 < 200.0F) &&
            (gap_prev2 > 1499.92505F) && (gap_prev1 > 1499.92505F))) &&
          (((blood_preesure - bp_save > 10) && (internal_counter >= 480.0F)) ||
           (internal_counter >= 1000.0F))) {
        if ((*out_std < 70.0000687F) || ((*out_std < 200.0F) && (gap_prev4 >
              400.0F) && (gap_prev3 > 1000.0F) && (gap_prev2 > 1499.92505F) &&
             (gap_prev1 > 2000.0F))) {
          s_l_c_1 = (short)t_o_d_1;
          s_h_c_l_1 = 1;
          s_l_c_l_1 = 1;
          s_h_c_1 = 1;
          curr_flag = 1;
        } else {
          s_l_c_l_1 = (short)t_o_d_1;
          s_h_c_l_1 = 1;
          s_l_c_1 = 1;
          s_h_c_1 = 1;
          curr_flag = 1;
        }
      }

      if (((curr_flag == 0) && (*out_std < 59.9998779F) && ((((*out_std <
               LastRechesGova / 2.5F) + (gap_prev4 < LastRechesGova / 2.5F)) +
             (gap_prev3 < LastRechesGova / 2.5F)) + (gap_prev2 < LastRechesGova /
             2.5F) >= 3)) || ((curr_flag == 0) && (*out_std < LastRechesGova /
            3.0F) && (gap_prev4 < LastRechesGova / 2.0F) && (gap_prev3 <
            LastRechesGova))) {
        s_h_c_1 = 0;
        s_h_c_l_1 = 0;
        LastRechesGova = 0.0F;
      }

      if ((((((*out_std > 1000.0F) + (gap_prev4 > 1000.0F)) + (gap_prev3 >
              1000.0F)) + (gap_prev2 > 1000.0F)) + (gap_prev1 > 1000.0F) >= 2) &&
          (gap_prev1 - *out_std < 350.005249F)) {
        s_l_c_1 = 1;
      }

      gap_prev1 = gap_prev2;
      gap_prev2 = gap_prev3;
      gap_prev3 = gap_prev4;
      gap_prev4 = *out_std;
    }
  }

  if (g_c_y == 75) {
    g_c_y = 60;
  }

  can_val_buff_ind++;
  can_val_buff[can_val_buff_ind - 1] = *out_std;
  if (can_val_buff_ind == 20) {
    can_val_buff_ind = 0;
  }

  mega_mean = 0.0F;
  for (t_o_d_1 = 0; t_o_d_1 < 20; t_o_d_1++) {
    if (can_val_buff[t_o_d_1] > 1499.92505F) {
      mega_mean++;
    }
  }

  if ((curr_flag == 0) && (s_l_c_1 > 1) && (mega_mean > 15.0F)) {
    s_l_c_1 = 1;
  }

  s_h_c_1--;
  if (s_h_c_1 <= 0) {
    s_h_c_1 = 1;
  }

  s_h_c_l_1--;
  if (s_h_c_l_1 == 0) {
    s_h_c_l_1 = 1;
  }

  s_l_c_l_1--;
  if (s_l_c_l_1 == 0) {
    s_l_c_l_1 = 1;
  }

  s_l_c_1--;
  if (s_l_c_1 <= 0) {
    s_l_c_1 = 1;
  }

  if ((*out_std < 0.1F) && (gap_prev4 < 1.0F)) {
    s_h_c_l_1 = 1;
    s_h_c_1 = 1;
  }

  if ((s_l_c_1 > 1) && (gap_prev1 < *out_std / 5.0F) && (gap_prev2 < *out_std /
       5.0F) && (gap_prev3 < *out_std / 5.0F) && (gap_prev4 < *out_std / 5.0F) &&
      (*out_std > 10.0F)) {
    s_l_c_1 = 1;
  }

  if ((s_l_c_1 > 1) && (*out_std > 699.986F) && (gap_prev4 > 699.986F)) {
    s_l_c_1 = 1;
  }

  if (s_h_c_1 > 1) {
    *out_std = -1.0F;
  }

  if (s_l_c_1 > 1) {
    *out_std = -2.0F;
  }

  if (s_h_c_l_1 > 1) {
    *out_std = -1.5F;
  }

  if (s_l_c_l_1 > 1) {
    *out_std = -2.5F;
  }
}

static void b_fft4plot(const float sig[50], float Y[129])
{
  creal32_T y[256];
  int i;
  int ix;
  int ju;
  int iy;
  boolean_T tst;
  float temp_re;
  int iDelta;
  int iDelta2;
  int k;
  int iheight;
  float temp_im;
  static const float fv28[129] = { 0.0F, -0.024541229F, -0.0490676761F,
    -0.0735645667F, -0.0980171412F, -0.122410677F, -0.146730468F, -0.170961902F,
    -0.195090324F, -0.219101235F, -0.242980197F, -0.266712785F, -0.290284663F,
    -0.313681751F, -0.336889863F, -0.359895051F, -0.382683456F, -0.40524134F,
    -0.427555084F, -0.449611336F, -0.471396744F, -0.492898226F, -0.514102757F,
    -0.534997642F, -0.555570245F, -0.575808227F, -0.59569931F, -0.615231633F,
    -0.634393334F, -0.653172851F, -0.671559F, -0.689540565F, -0.707106769F,
    -0.724247098F, -0.740951121F, -0.757208824F, -0.773010433F, -0.78834641F,
    -0.803207517F, -0.817584813F, -0.831469595F, -0.84485358F, -0.857728601F,
    -0.870086968F, -0.881921232F, -0.893224299F, -0.903989315F, -0.914209723F,
    -0.923879504F, -0.932992816F, -0.941544056F, -0.949528158F, -0.956940353F,
    -0.963776052F, -0.970031261F, -0.975702107F, -0.980785251F, -0.985277653F,
    -0.989176512F, -0.992479563F, -0.99518472F, -0.997290432F, -0.99879545F,
    -0.999698818F, -1.0F, -0.999698818F, -0.99879545F, -0.997290432F,
    -0.99518472F, -0.992479563F, -0.989176512F, -0.985277653F, -0.980785251F,
    -0.975702107F, -0.970031261F, -0.963776052F, -0.956940353F, -0.949528158F,
    -0.941544056F, -0.932992816F, -0.923879504F, -0.914209723F, -0.903989315F,
    -0.893224299F, -0.881921232F, -0.870086968F, -0.857728601F, -0.84485358F,
    -0.831469595F, -0.817584813F, -0.803207517F, -0.78834641F, -0.773010433F,
    -0.757208824F, -0.740951121F, -0.724247098F, -0.707106769F, -0.689540565F,
    -0.671559F, -0.653172851F, -0.634393334F, -0.615231633F, -0.59569931F,
    -0.575808227F, -0.555570245F, -0.534997642F, -0.514102757F, -0.492898226F,
    -0.471396744F, -0.449611336F, -0.427555084F, -0.40524134F, -0.382683456F,
    -0.359895051F, -0.336889863F, -0.313681751F, -0.290284663F, -0.266712785F,
    -0.242980197F, -0.219101235F, -0.195090324F, -0.170961902F, -0.146730468F,
    -0.122410677F, -0.0980171412F, -0.0735645667F, -0.0490676761F, -0.024541229F,
    -0.0F };

  static const float fv29[129] = { 1.0F, 0.999698818F, 0.99879545F, 0.997290432F,
    0.99518472F, 0.992479563F, 0.989176512F, 0.985277653F, 0.980785251F,
    0.975702107F, 0.970031261F, 0.963776052F, 0.956940353F, 0.949528158F,
    0.941544056F, 0.932992816F, 0.923879504F, 0.914209723F, 0.903989315F,
    0.893224299F, 0.881921232F, 0.870086968F, 0.857728601F, 0.84485358F,
    0.831469595F, 0.817584813F, 0.803207517F, 0.78834641F, 0.773010433F,
    0.757208824F, 0.740951121F, 0.724247098F, 0.707106769F, 0.689540565F,
    0.671559F, 0.653172851F, 0.634393334F, 0.615231633F, 0.59569931F,
    0.575808227F, 0.555570245F, 0.534997642F, 0.514102757F, 0.492898226F,
    0.471396744F, 0.449611336F, 0.427555084F, 0.40524134F, 0.382683456F,
    0.359895051F, 0.336889863F, 0.313681751F, 0.290284663F, 0.266712785F,
    0.242980197F, 0.219101235F, 0.195090324F, 0.170961902F, 0.146730468F,
    0.122410677F, 0.0980171412F, 0.0735645667F, 0.0490676761F, 0.024541229F,
    0.0F, -0.024541229F, -0.0490676761F, -0.0735645667F, -0.0980171412F,
    -0.122410677F, -0.146730468F, -0.170961902F, -0.195090324F, -0.219101235F,
    -0.242980197F, -0.266712785F, -0.290284663F, -0.313681751F, -0.336889863F,
    -0.359895051F, -0.382683456F, -0.40524134F, -0.427555084F, -0.449611336F,
    -0.471396744F, -0.492898226F, -0.514102757F, -0.534997642F, -0.555570245F,
    -0.575808227F, -0.59569931F, -0.615231633F, -0.634393334F, -0.653172851F,
    -0.671559F, -0.689540565F, -0.707106769F, -0.724247098F, -0.740951121F,
    -0.757208824F, -0.773010433F, -0.78834641F, -0.803207517F, -0.817584813F,
    -0.831469595F, -0.84485358F, -0.857728601F, -0.870086968F, -0.881921232F,
    -0.893224299F, -0.903989315F, -0.914209723F, -0.923879504F, -0.932992816F,
    -0.941544056F, -0.949528158F, -0.956940353F, -0.963776052F, -0.970031261F,
    -0.975702107F, -0.980785251F, -0.985277653F, -0.989176512F, -0.992479563F,
    -0.99518472F, -0.997290432F, -0.99879545F, -0.999698818F, -1.0F };

  creal32_T x[129];
  for (i = 0; i < 256; i++) {
    y[i].re = 0.0F;
    y[i].im = 0.0F;
  }

  ix = 0;
  ju = 0;
  iy = 0;
  for (i = 0; i < 49; i++) {
    y[iy].re = sig[ix];
    y[iy].im = 0.0F;
    iy = 256;
    tst = true;
    while (tst) {
      iy >>= 1;
      ju ^= iy;
      tst = ((ju & iy) == 0);
    }

    iy = ju;
    ix++;
  }

  y[iy].re = sig[ix];
  y[iy].im = 0.0F;
  for (i = 0; i < 256; i += 2) {
    temp_re = y[i + 1].re;
    y[i + 1].re = y[i].re - y[i + 1].re;
    y[i + 1].im = 0.0F;
    y[i].re += temp_re;
    y[i].im = 0.0F;
  }

  iDelta = 2;
  iDelta2 = 4;
  k = 64;
  iheight = 253;
  while (k > 0) {
    for (i = 0; i < iheight; i += iDelta2) {
      iy = i + iDelta;
      temp_re = y[iy].re;
      temp_im = y[iy].im;
      y[i + iDelta].re = y[i].re - y[iy].re;
      y[i + iDelta].im = y[i].im - y[iy].im;
      y[i].re += temp_re;
      y[i].im += temp_im;
    }

    iy = 1;
    for (ix = k; ix < 128; ix += k) {
      i = iy;
      ju = iy + iheight;
      while (i < ju) {
        temp_re = fv29[ix] * y[i + iDelta].re - fv28[ix] * y[i + iDelta].im;
        temp_im = fv29[ix] * y[i + iDelta].im + fv28[ix] * y[i + iDelta].re;
        y[i + iDelta].re = y[i].re - temp_re;
        y[i + iDelta].im = y[i].im - temp_im;
        y[i].re += temp_re;
        y[i].im += temp_im;
        i += iDelta2;
      }

      iy++;
    }

    k /= 2;
    iDelta = iDelta2;
    iDelta2 <<= 1;
    iheight -= iDelta;
  }

  for (i = 0; i < 129; i++) {
    if (y[i].im == 0.0F) {
      x[i].re = y[i].re / 50.0F;
      x[i].im = 0.0F;
    } else if (y[i].re == 0.0F) {
      x[i].re = 0.0F;
      x[i].im = y[i].im / 50.0F;
    } else {
      x[i].re = y[i].re / 50.0F;
      x[i].im = y[i].im / 50.0F;
    }

    Y[i] = 2.0F * hypotf(x[i].re, x[i].im);
  }
}

static unsigned short b_mod(unsigned short x, unsigned short y)
{
  unsigned short r;
  if (y == 0) {
    r = x;
  } else {
    r = (unsigned short)((unsigned int)x - (unsigned short)((unsigned int)x / y *
      y));
  }

  return r;
}

static double b_rand(void)
{
  double r;
  int hi;
  unsigned int test1;
  unsigned int test2;
  if (method == 4U) {
    hi = (int)(state / 127773U);
    test1 = 16807U * (state - hi * 127773U);
    test2 = 2836U * hi;
    if (test1 < test2) {
      state = (test1 - test2) + 2147483647U;
    } else {
      state = test1 - test2;
    }

    r = (double)state * 4.6566128752457969E-10;
  } else if (method == 5U) {
    test1 = 69069U * b_state[0] + 1234567U;
    test2 = b_state[1] ^ b_state[1] << 13;
    test2 ^= test2 >> 17;
    test2 ^= test2 << 5;
    b_state[0] = test1;
    b_state[1] = test2;
    r = (double)(test1 + test2) * 2.328306436538696E-10;
  } else {
    if (!state_not_empty) {
      memset(&c_state[0], 0, 625U * sizeof(unsigned int));
      twister_state_vector(c_state, 5489.0);
      state_not_empty = true;
    }

    r = eml_rand_mt19937ar(c_state);
  }

  return r;
}

static float b_rdivide(double x, float y)
{
  return (float)x / y;
}

static float b_std(const float varargin_1[50])
{
  float y;
  int ix;
  float xbar;
  int k;
  float r;
  ix = 0;
  xbar = varargin_1[0];
  for (k = 0; k < 49; k++) {
    ix++;
    xbar += varargin_1[ix];
  }

  xbar /= 50.0F;
  ix = 0;
  r = varargin_1[0] - xbar;
  y = r * r;
  for (k = 0; k < 49; k++) {
    ix++;
    r = varargin_1[ix] - xbar;
    y += r * r;
  }

  y /= 49.0F;
  return sqrtf(y);
}

static double b_sum(const double x[10])
{
  double y;
  int k;
  y = x[0];
  for (k = 0; k < 9; k++) {
    y += x[k + 1];
  }

  return y;
}

static void bp_algo(const int data_in[4], float original_ppg, const float
                    original_acc[3], float c_input_params_struct_pre_filte,
                    float d_input_params_struct_pre_filte, float
                    e_input_params_struct_pre_filte, float
                    f_input_params_struct_pre_filte, float
                    g_input_params_struct_pre_filte, float
                    h_input_params_struct_pre_filte, float
                    i_input_params_struct_pre_filte, g_struct_T
                    c_input_params_struct_freq_trac, const h_struct_T
                    input_params_struct_snr_params, float
                    c_input_params_struct_max_reset, boolean_T
                    input_params_struct_r_f_h_h, boolean_T
                    input_params_struct_r_f_h_s, unsigned char b_new_init_bp,
                    boolean_T b_bp_init_reset_flag, unsigned char
                    *blood_preesure, unsigned char *blood_preesure_raw, float
                    *ppg_clean, float *snr, float *activity_type, float
                    *acc_recursive_std, float *ppg_recursive_std, float ppg_fft
                    [18], boolean_T *bp_from_fft_flag, boolean_T *sat_flag_out)
{
  int i;
  unsigned char first_bp_forced;
  float b_data_in[4];
  float sheerit_mar;
  float pleth_lif_mar;
  float ppg;
  float first_BP;
  unsigned char b_fft_index;
  unsigned char b_ppg_buff_first_loop_flag;
  unsigned char b_original_ppg_buff_ind;
  float fv17[63];
  float fv18[189];
  boolean_T first_bp_flag;
  if ((!t_r_f_not_empty) || input_params_struct_r_f_h_h ||
      input_params_struct_r_f_h_s) {
    if ((!t_r_f_not_empty) || input_params_struct_r_f_h_h) {
      for (i = 0; i < 64; i++) {
        vect_ted_act[i] = 0.0F;
        vect_ted_men[i] = 0.0F;
        vect_pleth_makor[i] = 0.0F;
      }

      memset(&vect_act_makor[0], 0, 192U * sizeof(float));
      acc_run_flag = false;
    }

    t_r_f = true;
    t_r_f_not_empty = true;
    SNR = 0.0F;
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.8F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.5F;
    mega_bp_params.freq_tracking.hef.par3 = 0.95F;
    cd_har_test = 8;
    lock_harm_flag = false;
    bp_kodem = 0;
    saved_bp = 0;
    new_init_bp_static = false;
    saturation_cnt = 0.0F;
  }

  first_bp_forced = 0;
  *sat_flag_out = false;
  if (original_ppg == pow(2.0, 16.0) - 1.0) {
    saturation_cnt++;
    if (saturation_cnt > 100.0F) {
      *sat_flag_out = true;
    }
  } else {
    if (saturation_cnt > 100.0F) {
      t_r_f = true;
      first_bp_forced = saved_bp;
    }

    saturation_cnt = 0.0F;
    saved_bp = bp_kodem;
  }

  for (i = 0; i < 4; i++) {
    b_data_in[i] = (float)data_in[i];
  }

  init_filtering(b_data_in, c_input_params_struct_pre_filte,
                 d_input_params_struct_pre_filte,
                 e_input_params_struct_pre_filte,
                 f_input_params_struct_pre_filte,
                 g_input_params_struct_pre_filte,
                 h_input_params_struct_pre_filte,
                 i_input_params_struct_pre_filte, input_params_struct_r_f_h_h,
                 ppg_clean, &first_BP, acc_recursive_std, ppg_recursive_std,
                 &ppg, &pleth_lif_mar, &sheerit_mar);
  *activity_type = *acc_recursive_std;
  acc_analysis(bp_kodem, activity_type, SNR, input_params_struct_r_f_h_h);
  b_fft_index = 0;
  b_ppg_buff_first_loop_flag = 0;
  if ((!fft_index_not_empty) || input_params_struct_r_f_h_h) {
    fft_index = 0;
    fft_index_not_empty = true;
    original_ppg_buff_ind = 0;
    rst_index = 0;
    ppg_buff_first_loop_flag = 0;
    if (input_params_struct_r_f_h_h) {
      rst_index = 0;
    }
  }

  b_original_ppg_buff_ind = 0;
  rst_index++;
  if (rst_index <= 16) {
  } else {
    if (rst_index > 1000) {
      rst_index = 1000;
    }

    fft_index++;
    vect_ted_act[fft_index - 1] = *ppg_clean;
    vect_ted_men[fft_index - 1] = pleth_lif_mar;
    if (fft_index == 64) {
      fft_index = 0;
      ppg_buff_first_loop_flag = 1;
    }

    b_fft_index = fft_index;
    b_ppg_buff_first_loop_flag = ppg_buff_first_loop_flag;
    original_ppg_buff_ind++;
    if (original_ppg_buff_ind == 65) {
      memcpy(&fv17[0], &vect_pleth_makor[1], 63U * sizeof(float));
      memcpy(&vect_pleth_makor[0], &fv17[0], 63U * sizeof(float));
      for (i = 0; i < 3; i++) {
        memcpy(&fv18[63 * i], &vect_act_makor[1 + (i << 6)], 63U * sizeof(float));
        memcpy(&vect_act_makor[i << 6], &fv18[63 * i], 63U * sizeof(float));
      }

      original_ppg_buff_ind = 64;
    }

    vect_pleth_makor[original_ppg_buff_ind - 1] = original_ppg;
    for (i = 0; i < 3; i++) {
      vect_act_makor[(original_ppg_buff_ind + (i << 6)) - 1] = original_acc[i];
    }

    b_original_ppg_buff_ind = original_ppg_buff_ind;
  }

  first_bp_calc(b_fft_index, b_original_ppg_buff_ind, b_ppg_buff_first_loop_flag,
                original_ppg, *acc_recursive_std,
                c_input_params_struct_max_reset, input_params_struct_r_f_h_h,
                input_params_struct_r_f_h_s, false, b_bp_init_reset_flag,
                &first_BP, &first_bp_flag, ppg_fft, bp_from_fft_flag);
  if (b_new_init_bp > 0) {
    first_BP = (float)b_new_init_bp / 60.0F / 1.25F;
    new_init_bp_static = true;
    t_r_f = true;
  }

  if (first_bp_forced > 0) {
    first_BP = (float)first_bp_forced / 60.0F;
  }

  if (first_bp_flag || lock_harm_flag || new_init_bp_static) {
    if ((!harm_cnt_ok_not_empty) || t_r_f) {
      harm_cnt_ok = 0;
      harm_cnt_ok_not_empty = true;
    }

    if (lock_harm_flag && ((int)first_bp_flag > 0) && ((float)bp_kodem / 60.0F /
         first_BP > 1.88F) && ((float)bp_kodem / 60.0F / first_BP < 2.12F) &&
        (*acc_recursive_std < 40000.0F)) {
      harm_cnt_ok++;
      if (harm_cnt_ok == 5) {
        t_r_f = true;
      }

      lock_harm_flag = false;
    } else {
      if (lock_harm_flag && first_bp_flag) {
        lock_harm_flag = false;
        harm_cnt_ok = 0;
      }
    }

    cont_bp_calc(*ppg_clean, *activity_type, t_r_f,
                 c_input_params_struct_freq_trac.f1,
                 c_input_params_struct_freq_trac.f2,
                 c_input_params_struct_freq_trac.pad1,
                 c_input_params_struct_freq_trac.chi2,
                 c_input_params_struct_freq_trac.zek,
                 c_input_params_struct_freq_trac.fs,
                 c_input_params_struct_freq_trac.tr_fi.memory,
                 c_input_params_struct_freq_trac.tr_fi.b1,
                 c_input_params_struct_freq_trac.tr_fi.b2, first_BP,
                 input_params_struct_snr_params.beta, &ppg, snr, &sheerit_mar);
    first_bp_forced = (unsigned char)roundf(ppg);
    if ((!mem_not_empty) || t_r_f) {
      mem = (unsigned short)(first_bp_forced << 3);
      mem_not_empty = true;
    }

    mem = (unsigned short)((unsigned int)(unsigned short)((unsigned int)
      (unsigned short)(29U * mem) + 3 * (first_bp_forced << 3)) >> 5);
    *blood_preesure = (unsigned char)((unsigned int)(unsigned short)(mem + 7U) >>
      3);
    *blood_preesure_raw = (unsigned char)roundf(ppg);
    bp_kodem = *blood_preesure;
    cd_har_test--;
    if ((cd_har_test == 0) && (*blood_preesure > 75) && (!lock_harm_flag) &&
        (*snr < 0.0F)) {
      cd_har_test = 8;
      lock_harm_flag = true;
    }

    if (cd_har_test == 0) {
      cd_har_test = 8;
    }

    t_r_f = false;
  } else {
    *snr = 0.0F;
    *blood_preesure = 0;
    *blood_preesure_raw = 0;
  }
}

static float bpf_noise(float b[5], float a[5], float x, boolean_T reset)
{
  float y;
  int i;
  float b_a;
  float c_a;
  if ((!f_z_not_empty) || reset) {
    for (i = 0; i < 5; i++) {
      f_z[i] = 0.0F;
    }

    f_z_not_empty = true;
  }

  b_a = a[0];
  c_a = a[0];
  for (i = 0; i < 5; i++) {
    b[i] /= b_a;
    a[i] /= c_a;
  }

  y = b[0] * x + f_z[0];
  for (i = 0; i < 4; i++) {
    f_z[i] = (b[1 + i] * x + f_z[1 + i]) - a[1 + i] * y;
  }

  return y;
}

static float bpf_sig(float b[5], float a[5], float x, boolean_T reset)
{
  float y;
  int i;
  float b_a;
  float c_a;
  if ((!z_not_empty) || reset) {
    for (i = 0; i < 5; i++) {
      z[i] = 0.0F;
    }

    z_not_empty = true;
  }

  b_a = a[0];
  c_a = a[0];
  for (i = 0; i < 5; i++) {
    b[i] /= b_a;
    a[i] /= c_a;
  }

  y = b[0] * x + z[0];
  for (i = 0; i < 4; i++) {
    z[i] = (b[1 + i] * x + z[1 + i]) - a[1 + i] * y;
  }

  return y;
}

static float bpf_sig2(float b[5], float a[5], float x, boolean_T reset)
{
  float y;
  int i;
  float b_a;
  float c_a;
  if ((!b_z_not_empty) || reset) {
    for (i = 0; i < 5; i++) {
      b_z[i] = 0.0F;
    }

    b_z_not_empty = true;
  }

  b_a = a[0];
  c_a = a[0];
  for (i = 0; i < 5; i++) {
    b[i] /= b_a;
    a[i] /= c_a;
  }

  y = b[0] * x + b_z[0];
  for (i = 0; i < 4; i++) {
    b_z[i] = (b[1 + i] * x + b_z[1 + i]) - a[1 + i] * y;
  }

  return y;
}

static float bpf_sig3(float b[5], float a[5], float x, boolean_T reset)
{
  float y;
  int i;
  float b_a;
  float c_a;
  if ((!c_z_not_empty) || reset) {
    for (i = 0; i < 5; i++) {
      c_z[i] = 0.0F;
    }

    c_z_not_empty = true;
  }

  b_a = a[0];
  c_a = a[0];
  for (i = 0; i < 5; i++) {
    b[i] /= b_a;
    a[i] /= c_a;
  }

  y = b[0] * x + c_z[0];
  for (i = 0; i < 4; i++) {
    c_z[i] = (b[1 + i] * x + c_z[1 + i]) - a[1 + i] * y;
  }

  return y;
}

static float bpf_sig4(double b[5], double a[5], float x, boolean_T reset)
{
  float y;
  int i;
  double b_a;
  double c_a;
  if ((!d_z_not_empty) || reset) {
    for (i = 0; i < 5; i++) {
      d_z[i] = 0.0F;
    }

    d_z_not_empty = true;
  }

  b_a = a[0];
  c_a = a[0];
  for (i = 0; i < 5; i++) {
    b[i] /= b_a;
    a[i] /= c_a;
  }

  y = (float)b[0] * x + d_z[0];
  for (i = 0; i < 4; i++) {
    d_z[i] = ((float)b[i + 1] * x + d_z[1 + i]) - (float)a[i + 1] * y;
  }

  return y;
}

static float bpf_sig5(double b[5], double a[5], float x, boolean_T reset)
{
  float y;
  int i;
  double b_a;
  double c_a;
  if ((!e_z_not_empty) || reset) {
    for (i = 0; i < 5; i++) {
      e_z[i] = 0.0F;
    }

    e_z_not_empty = true;
  }

  b_a = a[0];
  c_a = a[0];
  for (i = 0; i < 5; i++) {
    b[i] /= b_a;
    a[i] /= c_a;
  }

  y = (float)b[0] * x + e_z[0];
  for (i = 0; i < 4; i++) {
    e_z[i] = ((float)b[i + 1] * x + e_z[1 + i]) - (float)a[i + 1] * y;
  }

  return y;
}

static void c_fft4plot(const float sig[100], float Y[129])
{
  creal32_T y[256];
  int i;
  int ix;
  int ju;
  int iy;
  boolean_T tst;
  float temp_re;
  int iDelta;
  int iDelta2;
  int k;
  int iheight;
  float temp_im;
  static const float fv30[129] = { 0.0F, -0.024541229F, -0.0490676761F,
    -0.0735645667F, -0.0980171412F, -0.122410677F, -0.146730468F, -0.170961902F,
    -0.195090324F, -0.219101235F, -0.242980197F, -0.266712785F, -0.290284663F,
    -0.313681751F, -0.336889863F, -0.359895051F, -0.382683456F, -0.40524134F,
    -0.427555084F, -0.449611336F, -0.471396744F, -0.492898226F, -0.514102757F,
    -0.534997642F, -0.555570245F, -0.575808227F, -0.59569931F, -0.615231633F,
    -0.634393334F, -0.653172851F, -0.671559F, -0.689540565F, -0.707106769F,
    -0.724247098F, -0.740951121F, -0.757208824F, -0.773010433F, -0.78834641F,
    -0.803207517F, -0.817584813F, -0.831469595F, -0.84485358F, -0.857728601F,
    -0.870086968F, -0.881921232F, -0.893224299F, -0.903989315F, -0.914209723F,
    -0.923879504F, -0.932992816F, -0.941544056F, -0.949528158F, -0.956940353F,
    -0.963776052F, -0.970031261F, -0.975702107F, -0.980785251F, -0.985277653F,
    -0.989176512F, -0.992479563F, -0.99518472F, -0.997290432F, -0.99879545F,
    -0.999698818F, -1.0F, -0.999698818F, -0.99879545F, -0.997290432F,
    -0.99518472F, -0.992479563F, -0.989176512F, -0.985277653F, -0.980785251F,
    -0.975702107F, -0.970031261F, -0.963776052F, -0.956940353F, -0.949528158F,
    -0.941544056F, -0.932992816F, -0.923879504F, -0.914209723F, -0.903989315F,
    -0.893224299F, -0.881921232F, -0.870086968F, -0.857728601F, -0.84485358F,
    -0.831469595F, -0.817584813F, -0.803207517F, -0.78834641F, -0.773010433F,
    -0.757208824F, -0.740951121F, -0.724247098F, -0.707106769F, -0.689540565F,
    -0.671559F, -0.653172851F, -0.634393334F, -0.615231633F, -0.59569931F,
    -0.575808227F, -0.555570245F, -0.534997642F, -0.514102757F, -0.492898226F,
    -0.471396744F, -0.449611336F, -0.427555084F, -0.40524134F, -0.382683456F,
    -0.359895051F, -0.336889863F, -0.313681751F, -0.290284663F, -0.266712785F,
    -0.242980197F, -0.219101235F, -0.195090324F, -0.170961902F, -0.146730468F,
    -0.122410677F, -0.0980171412F, -0.0735645667F, -0.0490676761F, -0.024541229F,
    -0.0F };

  static const float fv31[129] = { 1.0F, 0.999698818F, 0.99879545F, 0.997290432F,
    0.99518472F, 0.992479563F, 0.989176512F, 0.985277653F, 0.980785251F,
    0.975702107F, 0.970031261F, 0.963776052F, 0.956940353F, 0.949528158F,
    0.941544056F, 0.932992816F, 0.923879504F, 0.914209723F, 0.903989315F,
    0.893224299F, 0.881921232F, 0.870086968F, 0.857728601F, 0.84485358F,
    0.831469595F, 0.817584813F, 0.803207517F, 0.78834641F, 0.773010433F,
    0.757208824F, 0.740951121F, 0.724247098F, 0.707106769F, 0.689540565F,
    0.671559F, 0.653172851F, 0.634393334F, 0.615231633F, 0.59569931F,
    0.575808227F, 0.555570245F, 0.534997642F, 0.514102757F, 0.492898226F,
    0.471396744F, 0.449611336F, 0.427555084F, 0.40524134F, 0.382683456F,
    0.359895051F, 0.336889863F, 0.313681751F, 0.290284663F, 0.266712785F,
    0.242980197F, 0.219101235F, 0.195090324F, 0.170961902F, 0.146730468F,
    0.122410677F, 0.0980171412F, 0.0735645667F, 0.0490676761F, 0.024541229F,
    0.0F, -0.024541229F, -0.0490676761F, -0.0735645667F, -0.0980171412F,
    -0.122410677F, -0.146730468F, -0.170961902F, -0.195090324F, -0.219101235F,
    -0.242980197F, -0.266712785F, -0.290284663F, -0.313681751F, -0.336889863F,
    -0.359895051F, -0.382683456F, -0.40524134F, -0.427555084F, -0.449611336F,
    -0.471396744F, -0.492898226F, -0.514102757F, -0.534997642F, -0.555570245F,
    -0.575808227F, -0.59569931F, -0.615231633F, -0.634393334F, -0.653172851F,
    -0.671559F, -0.689540565F, -0.707106769F, -0.724247098F, -0.740951121F,
    -0.757208824F, -0.773010433F, -0.78834641F, -0.803207517F, -0.817584813F,
    -0.831469595F, -0.84485358F, -0.857728601F, -0.870086968F, -0.881921232F,
    -0.893224299F, -0.903989315F, -0.914209723F, -0.923879504F, -0.932992816F,
    -0.941544056F, -0.949528158F, -0.956940353F, -0.963776052F, -0.970031261F,
    -0.975702107F, -0.980785251F, -0.985277653F, -0.989176512F, -0.992479563F,
    -0.99518472F, -0.997290432F, -0.99879545F, -0.999698818F, -1.0F };

  creal32_T x[129];
  for (i = 0; i < 256; i++) {
    y[i].re = 0.0F;
    y[i].im = 0.0F;
  }

  ix = 0;
  ju = 0;
  iy = 0;
  for (i = 0; i < 99; i++) {
    y[iy].re = sig[ix];
    y[iy].im = 0.0F;
    iy = 256;
    tst = true;
    while (tst) {
      iy >>= 1;
      ju ^= iy;
      tst = ((ju & iy) == 0);
    }

    iy = ju;
    ix++;
  }

  y[iy].re = sig[ix];
  y[iy].im = 0.0F;
  for (i = 0; i < 256; i += 2) {
    temp_re = y[i + 1].re;
    y[i + 1].re = y[i].re - y[i + 1].re;
    y[i + 1].im = 0.0F;
    y[i].re += temp_re;
    y[i].im = 0.0F;
  }

  iDelta = 2;
  iDelta2 = 4;
  k = 64;
  iheight = 253;
  while (k > 0) {
    for (i = 0; i < iheight; i += iDelta2) {
      iy = i + iDelta;
      temp_re = y[iy].re;
      temp_im = y[iy].im;
      y[i + iDelta].re = y[i].re - y[iy].re;
      y[i + iDelta].im = y[i].im - y[iy].im;
      y[i].re += temp_re;
      y[i].im += temp_im;
    }

    iy = 1;
    for (ix = k; ix < 128; ix += k) {
      i = iy;
      ju = iy + iheight;
      while (i < ju) {
        temp_re = fv31[ix] * y[i + iDelta].re - fv30[ix] * y[i + iDelta].im;
        temp_im = fv31[ix] * y[i + iDelta].im + fv30[ix] * y[i + iDelta].re;
        y[i + iDelta].re = y[i].re - temp_re;
        y[i + iDelta].im = y[i].im - temp_im;
        y[i].re += temp_re;
        y[i].im += temp_im;
        i += iDelta2;
      }

      iy++;
    }

    k /= 2;
    iDelta = iDelta2;
    iDelta2 <<= 1;
    iheight -= iDelta;
  }

  for (i = 0; i < 129; i++) {
    if (y[i].im == 0.0F) {
      x[i].re = y[i].re / 100.0F;
      x[i].im = 0.0F;
    } else if (y[i].re == 0.0F) {
      x[i].re = 0.0F;
      x[i].im = y[i].im / 100.0F;
    } else {
      x[i].re = y[i].re / 100.0F;
      x[i].im = y[i].im / 100.0F;
    }

    Y[i] = 2.0F * hypotf(x[i].re, x[i].im);
  }
}

static float c_mod(float x, float y)
{
  float r;
  if (y == 0.0F) {
    r = x;
  } else if (y == floorf(y)) {
    r = x - floorf(x / y) * y;
  } else {
    r = x / y;
    r = (r - floorf(r)) * y;
  }

  return r;
}

static float c_std(const float varargin_1[100])
{
  float y;
  int ix;
  float xbar;
  int k;
  float r;
  ix = 0;
  xbar = varargin_1[0];
  for (k = 0; k < 99; k++) {
    ix++;
    xbar += varargin_1[ix];
  }

  xbar /= 100.0F;
  ix = 0;
  r = varargin_1[0] - xbar;
  y = r * r;
  for (k = 0; k < 99; k++) {
    ix++;
    r = varargin_1[ix] - xbar;
    y += r * r;
  }

  y /= 99.0F;
  return sqrtf(y);
}

static void calc_bp_p(float ppg, float ppg2, boolean_T reset_flag, float
                      *bp_peaks_out_1, float *S, float ppg_buff_out[50])
{
  int i;
  float fv25[49];
  float fv26[49];
  float peaks_dc_up[10];
  unsigned char num_peaks_ppg_up;
  unsigned char Peaks_ppg_down2[10];
  float fv27[50];
  float peaks_dc_down[10];
  unsigned char num_peaks_ppg_down;
  unsigned char Peaks_ppg_down[10];
  double to_del_1[10];
  unsigned char b_i;
  unsigned char k;
  unsigned char Peaks_ppg_up2[10];
  signed char to_del_1_b[10];
  int ind_tmp;
  double d1;
  int j;
  signed char b_to_del_1_b;
  double peaks_dc_up2[10];
  double peaks_dc_down2[10];
  float bp_peaks_up[9];
  float bp_peaks_down[9];
  float BPs1[18];
  float sum_hr;
  float cnt_hr;
  boolean_T inds[18];
  float cnt_diff_hr;
  boolean_T b_inds;
  float sum_diff_hr;
  float BP_no_outliers[18];
  float a;
  float hr_peaks_mean;
  boolean_T guard1 = false;
  int b_hr_peaks_mean;
  *S = 0.0F;
  if ((!ppg_buff_not_empty) || reset_flag) {
    ppg_buff_not_empty = true;
    for (i = 0; i < 50; i++) {
      ppg_buff[i] = 0.0F;
      ppg_buff2[i] = 0.0F;
    }

    b_ppg_buff_ind = 0;
    b_tot_cnt = 0;
  }

  b_ppg_buff_ind++;
  if (b_ppg_buff_ind == 51) {
    memcpy(&fv25[0], &ppg_buff[1], 49U * sizeof(float));
    for (i = 0; i < 49; i++) {
      ppg_buff[i] = fv25[i];
      fv26[i] = ppg_buff2[1 + i];
    }

    memcpy(&ppg_buff2[0], &fv26[0], 49U * sizeof(float));
    b_ppg_buff_ind = 50;
  }

  ppg_buff[b_ppg_buff_ind - 1] = ppg;
  ppg_buff2[b_ppg_buff_ind - 1] = ppg2;
  memcpy(&ppg_buff_out[0], &ppg_buff2[0], 50U * sizeof(float));
  b_tot_cnt++;
  if (b_tot_cnt < 40) {
    *bp_peaks_out_1 = 0.0F;
  } else {
    b_tot_cnt = 40;
    if (b_ppg_buff_ind < 50) {
      *bp_peaks_out_1 = 0.0F;
    } else {
      fpeaks2(ppg_buff, b_ppg_buff_ind, Peaks_ppg_down2, &num_peaks_ppg_up,
              peaks_dc_up);
      for (i = 0; i < 50; i++) {
        fv27[i] = -ppg_buff[i];
      }

      fpeaks2(fv27, b_ppg_buff_ind, Peaks_ppg_down, &num_peaks_ppg_down,
              peaks_dc_down);
      memset(&to_del_1[0], 0, 10U * sizeof(double));
      for (b_i = 2; b_i <= num_peaks_ppg_up; b_i++) {
        i = 1;
        for (k = Peaks_ppg_down2[b_i - 2]; k <= Peaks_ppg_down2[b_i - 1]; k++) {
          if (ppg_buff[k - 1] <= 0.0F) {
            i = 0;
          }
        }

        if (((unsigned char)((unsigned int)Peaks_ppg_down2[b_i - 1] -
                             Peaks_ppg_down2[b_i - 2]) < 6) && (i != 0)) {
          to_del_1[b_i - 1] = 1.0;
        }
      }

      for (i = 0; i < 10; i++) {
        Peaks_ppg_up2[i] = 0;
        to_del_1_b[i] = (signed char)to_del_1[i];
      }

      ind_tmp = -1;
      d1 = 10.0 - b_sum(to_del_1);
      for (i = 0; i < (int)d1; i++) {
        for (j = 0; j < 10; j++) {
          b_to_del_1_b = to_del_1_b[j];
          if (to_del_1_b[j] == 0) {
            ind_tmp++;
            Peaks_ppg_up2[ind_tmp] = Peaks_ppg_down2[j];
            b_to_del_1_b = 1;
          }

          to_del_1_b[j] = b_to_del_1_b;
        }
      }

      for (i = 0; i < 10; i++) {
        peaks_dc_up2[i] = 0.0;
        to_del_1_b[i] = (signed char)to_del_1[i];
      }

      ind_tmp = -1;
      d1 = 10.0 - b_sum(to_del_1);
      for (i = 0; i < (int)d1; i++) {
        for (j = 0; j < 10; j++) {
          b_to_del_1_b = to_del_1_b[j];
          if (to_del_1_b[j] == 0) {
            ind_tmp++;
            peaks_dc_up2[ind_tmp] = peaks_dc_up[j];
            b_to_del_1_b = 1;
          }

          to_del_1_b[j] = b_to_del_1_b;
        }
      }

      num_peaks_ppg_up = (unsigned char)rt_roundd((double)num_peaks_ppg_up -
        b_sum(to_del_1));
      memset(&to_del_1[0], 0, 10U * sizeof(double));
      for (b_i = 2; b_i <= num_peaks_ppg_down; b_i++) {
        i = 1;
        for (k = Peaks_ppg_down[b_i - 2]; k <= Peaks_ppg_down[b_i - 1]; k++) {
          if (ppg_buff[k - 1] >= 0.0F) {
            i = 0;
          }
        }

        if (((unsigned char)((unsigned int)Peaks_ppg_down[b_i - 1] -
                             Peaks_ppg_down[b_i - 2]) < 6) && (i != 0)) {
          to_del_1[b_i - 1] = 1.0;
        }
      }

      for (i = 0; i < 10; i++) {
        Peaks_ppg_down2[i] = 0;
        to_del_1_b[i] = (signed char)to_del_1[i];
      }

      ind_tmp = -1;
      d1 = 10.0 - b_sum(to_del_1);
      for (i = 0; i < (int)d1; i++) {
        for (j = 0; j < 10; j++) {
          b_to_del_1_b = to_del_1_b[j];
          if (to_del_1_b[j] == 0) {
            ind_tmp++;
            Peaks_ppg_down2[ind_tmp] = Peaks_ppg_down[j];
            b_to_del_1_b = 1;
          }

          to_del_1_b[j] = b_to_del_1_b;
        }
      }

      for (i = 0; i < 10; i++) {
        peaks_dc_down2[i] = 0.0;
        to_del_1_b[i] = (signed char)to_del_1[i];
      }

      ind_tmp = -1;
      d1 = 10.0 - b_sum(to_del_1);
      for (i = 0; i < (int)d1; i++) {
        for (j = 0; j < 10; j++) {
          b_to_del_1_b = to_del_1_b[j];
          if (to_del_1_b[j] == 0) {
            ind_tmp++;
            peaks_dc_down2[ind_tmp] = peaks_dc_down[j];
            b_to_del_1_b = 1;
          }

          to_del_1_b[j] = b_to_del_1_b;
        }
      }

      num_peaks_ppg_down = (unsigned char)rt_roundd((double)num_peaks_ppg_down -
        b_sum(to_del_1));
      for (i = 0; i < 9; i++) {
        bp_peaks_up[i] = 0.0F;
      }

      if (num_peaks_ppg_up > 1) {
        for (b_i = 2; b_i <= num_peaks_ppg_up; b_i++) {
          bp_peaks_up[b_i - 2] = b_rdivide(60.0, (float)(Peaks_ppg_up2[b_i - 1]
            - Peaks_ppg_up2[b_i - 2]) / 10.0F);
        }
      }

      for (i = 0; i < 9; i++) {
        bp_peaks_down[i] = 0.0F;
      }

      if (num_peaks_ppg_down > 1) {
        for (b_i = 2; b_i <= num_peaks_ppg_down; b_i++) {
          bp_peaks_down[b_i - 2] = b_rdivide(60.0, (float)(Peaks_ppg_down2[b_i -
            1] - Peaks_ppg_down2[b_i - 2]) / 10.0F);
        }
      }

      for (i = 0; i < 9; i++) {
        BPs1[i] = bp_peaks_up[i];
      }

      for (i = 0; i < 9; i++) {
        BPs1[i + 9] = bp_peaks_down[i];
      }

      sum_hr = 0.0F;
      cnt_hr = 0.0F;
      for (ind_tmp = 0; ind_tmp < 18; ind_tmp++) {
        cnt_diff_hr = BPs1[ind_tmp];
        if (BPs1[ind_tmp] < 35.0F) {
          cnt_diff_hr = 0.0F;
        }

        b_inds = (cnt_diff_hr > 0.0F);
        if (b_inds) {
          sum_hr += cnt_diff_hr;
          cnt_hr++;
        }

        BPs1[ind_tmp] = cnt_diff_hr;
        inds[ind_tmp] = b_inds;
      }

      sum_hr /= cnt_hr;
      sum_diff_hr = 0.0F;
      cnt_diff_hr = 0.0F;
      for (ind_tmp = 0; ind_tmp < 18; ind_tmp++) {
        if (inds[ind_tmp]) {
          a = BPs1[ind_tmp] - sum_hr;
          sum_diff_hr += a * a;
          cnt_diff_hr++;
        }

        BP_no_outliers[ind_tmp] = 0.0F;
      }

      *S = sqrtf(sum_diff_hr / (cnt_diff_hr - 1.0F));
      i = -1;
      for (ind_tmp = 0; ind_tmp < 18; ind_tmp++) {
        if (inds[ind_tmp] && (BPs1[ind_tmp] > 0.0F)) {
          if ((BPs1[ind_tmp] > sum_hr + 2.0F * *S) || (BPs1[ind_tmp] < sum_hr -
               2.0F * *S)) {
            b_inds = true;
          } else {
            b_inds = false;
          }

          if (!b_inds) {
            i++;
            BP_no_outliers[i] = BPs1[ind_tmp];
          }
        }
      }

      sum_hr = 0.0F;
      cnt_hr = 0.0F;
      for (ind_tmp = 0; ind_tmp < 18; ind_tmp++) {
        if (BP_no_outliers[ind_tmp] > 0.0F) {
          sum_hr += BP_no_outliers[ind_tmp];
          cnt_hr++;
        }
      }

      hr_peaks_mean = sum_hr / cnt_hr;
      if (hr_peaks_mean < 40.0F) {
        i = 2;
      } else if (hr_peaks_mean < 60.0F) {
        i = 3;
      } else if (hr_peaks_mean < 80.0F) {
        i = 4;
      } else {
        i = 5;
      }

      sum_diff_hr = 0.0F;
      cnt_hr = 0.0F;
      for (ind_tmp = 0; ind_tmp < 18; ind_tmp++) {
        if (BP_no_outliers[ind_tmp] > 0.0F) {
          a = BP_no_outliers[ind_tmp] - hr_peaks_mean;
          sum_diff_hr += a * a;
          cnt_hr++;
        }
      }

      guard1 = false;
      if ((num_peaks_ppg_up >= i) || (num_peaks_ppg_down >= i)) {
        if (hr_peaks_mean > 150.0F) {
          b_hr_peaks_mean = 40;
        } else if (hr_peaks_mean > 120.0F) {
          b_hr_peaks_mean = 20;
        } else {
          b_hr_peaks_mean = 13;
        }

        if (((double)sqrtf(sum_diff_hr / (cnt_hr - 1.0F)) < b_hr_peaks_mean) &&
            (cnt_hr >= 4.0F)) {
          *bp_peaks_out_1 = hr_peaks_mean;
        } else {
          guard1 = true;
        }
      } else {
        guard1 = true;
      }

      if (guard1) {
        *bp_peaks_out_1 = 0.0F;
      }

      sum_hr = 0.0F;
      cnt_diff_hr = 0.0F;
      for (ind_tmp = 0; ind_tmp < 10; ind_tmp++) {
        if (peaks_dc_up2[ind_tmp] > 0.0) {
          sum_hr += (float)peaks_dc_up2[ind_tmp];
          cnt_diff_hr++;
        }
      }

      cnt_hr = sum_hr / cnt_diff_hr;
      sum_hr = 0.0F;
      cnt_diff_hr = 0.0F;
      for (ind_tmp = 0; ind_tmp < 10; ind_tmp++) {
        if (peaks_dc_down2[ind_tmp] > 0.0) {
          sum_hr += (float)peaks_dc_down2[ind_tmp];
          cnt_diff_hr++;
        }
      }

      if ((cnt_hr + sum_hr / cnt_diff_hr < 5.0F) && (hr_peaks_mean < 180.0F) &&
          (hr_peaks_mean > 0.0F) && (*S > 15.0F)) {
        *bp_peaks_out_1 = 0.0F;
      }
    }
  }
}

static void cont_bp_calc(float ppg_clean, float activity_type, boolean_T
  reset_flag, float c_input_params_struct_freq_trac, float
  d_input_params_struct_freq_trac, float e_input_params_struct_freq_trac, float
  f_input_params_struct_freq_trac, float g_input_params_struct_freq_trac, float
  h_input_params_struct_freq_trac, float i_input_params_struct_freq_trac, float
  j_input_params_struct_freq_trac, float k_input_params_struct_freq_trac, float
  l_input_params_struct_freq_trac, float c_input_params_struct_snr_param, float *
  freq, float *snr, float *bpf_s)
{
  int i;
  float lom_f;
  float b_chi2;
  float fv24[2];
  float lims[2];
  float mek2[4];
  float rot_j;
  float dm;
  if ((!rftd_not_empty) || reset_flag) {
    pad1 = e_input_params_struct_freq_trac;
    rftd = 0;
    rftd_not_empty = true;
    Pold = 1.0F;
    for (i = 0; i < 5; i++) {
      vector1[i] = 0.0F;
    }

    for (i = 0; i < 4; i++) {
      vector2[i] = 0.0F;
    }

    tg = 1.0F;
    del1 = c_input_params_struct_freq_trac;
    zavit = -2.0F * cosf(6.28318548F * l_input_params_struct_freq_trac /
                         h_input_params_struct_freq_trac);
    theta2 = 0.0F;
    hal_d = d_input_params_struct_freq_trac;
    taf = 0.0F;
    for (i = 0; i < 2; i++) {
      vector_1_1[i] = 0.0F;
      kefel[i] = 0.0F;
      mehir[i] = 0.0F;
      vector_d[i] = 0.0F;
    }

    HBS = 0.1F;
    b_bp_kodem = 0.0F;
    counter = 0;
  }

  counter++;
  if (counter > 1000) {
    counter = 1000;
  }

  if ((!shev_up_not_empty) || reset_flag) {
    shev_up = 0.06F;
    shev_up_not_empty = true;
    shev_dwn = 0.12F;
    for (i = 0; i < 3; i++) {
      vec_2_b[i] = 0.0F;
    }

    for (i = 0; i < 2; i++) {
      vec_2_a[i] = 0.0F;
    }

    trig_zav = 0.0F;
  }

  rftd++;
  if (rftd < 50) {
    mega_bp_params.freq_tracking.hef.par3 = 0.95F;
  } else if (rftd < 100) {
    mega_bp_params.freq_tracking.hef.par3 = 0.96F;
  } else if (rftd < 150) {
    mega_bp_params.freq_tracking.hef.par3 = 0.97F;
  } else {
    mega_bp_params.freq_tracking.hef.par3 = 0.985F;
  }

  if (rftd > 200) {
    rftd = 200;
  }

  if (activity_type > 35000.0F) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.8F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.7F;
  }

  if ((activity_type == -1.5F) && (b_bp_kodem < 2.4F) && (SNR > 1.5F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.97F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.6F;
    mega_bp_params.freq_tracking.hef.par3 = 0.977F;
    if ((b_bp_kodem < 1.5F) && (SNR > 3.0F)) {
      mega_bp_params.freq_tracking.tr_fi.p1 = 0.8F;
      mega_bp_params.freq_tracking.tr_fi.p2 = 1.6F;
      mega_bp_params.freq_tracking.hef.par3 = 0.985F;
    }
  } else if ((activity_type == -1.5F) && (b_bp_kodem < 2.4F) && (SNR > 0.0F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.8F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.6F;
    mega_bp_params.freq_tracking.hef.par3 = 0.98F;
  } else if ((activity_type == -1.5F) && (b_bp_kodem > 2.4F) && (SNR < -2.0F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.8F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.4F;
    mega_bp_params.freq_tracking.hef.par3 = 0.987F;
  } else if ((activity_type == -1.0F) && (b_bp_kodem < 1.7F) && (SNR > 2.0F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.8F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.8F;
    mega_bp_params.freq_tracking.hef.par3 = 0.985F;
  } else if ((activity_type == -1.0F) && (b_bp_kodem < 1.7F) && (SNR <= 2.0F) &&
             (SNR > -0.5F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.8F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.4F;
    mega_bp_params.freq_tracking.hef.par3 = 0.99F;
  } else if ((activity_type == -1.0F) && (b_bp_kodem < 2.2F) && (SNR > 2.5F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.9F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.7F;
    mega_bp_params.freq_tracking.hef.par3 = 0.97F;
    HBS *= 1.01F;
  } else if ((activity_type == -1.0F) && (b_bp_kodem > 2.1F) && (SNR < 0.0F)) {
    if (SNR < 0.0F) {
      mega_bp_params.freq_tracking.tr_fi.p1 = 0.6F;
      mega_bp_params.freq_tracking.tr_fi.p2 = 1.7F;
      mega_bp_params.freq_tracking.hef.par3 = 0.9999F;
    } else {
      mega_bp_params.freq_tracking.tr_fi.p1 = 0.6F;
      mega_bp_params.freq_tracking.tr_fi.p2 = 1.5F;
      mega_bp_params.freq_tracking.hef.par3 = 0.97F;
      HBS *= 0.98F;
    }
  } else if ((activity_type == -1.0F) && (SNR < 0.0F)) {
    if (acc_run_flag == 0) {
      mega_bp_params.freq_tracking.tr_fi.p1 = 0.8F;
      mega_bp_params.freq_tracking.tr_fi.p2 = 1.9F;
      mega_bp_params.freq_tracking.hef.par3 = 0.97F;
    } else {
      mega_bp_params.freq_tracking.tr_fi.p1 = 0.95F;
      mega_bp_params.freq_tracking.tr_fi.p2 = 1.8F;
      mega_bp_params.freq_tracking.hef.par3 = 0.955F;
    }

    if (SNR < -2.5F) {
      mega_bp_params.freq_tracking.tr_fi.p1 = 0.8F;
      mega_bp_params.freq_tracking.tr_fi.p2 = 1.85F;
      mega_bp_params.freq_tracking.hef.par3 = 0.995F;
    }
  } else if ((activity_type == -2.5F) && (b_bp_kodem > 2.3F) && (SNR > -2.0F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.5F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.5F;
    mega_bp_params.freq_tracking.hef.par3 = 0.96F;
  } else if ((activity_type == -2.5F) && (b_bp_kodem > 1.5F) && (SNR > -2.0F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.5F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.6F;
    mega_bp_params.freq_tracking.hef.par3 = 0.96F;
  } else if ((activity_type == -2.0F) && (b_bp_kodem > 2.3F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.3F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.2F;
    mega_bp_params.freq_tracking.hef.par3 = 0.96F;
  } else if ((activity_type == -2.0F) && (b_bp_kodem > 1.5F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.4F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.3F;
    mega_bp_params.freq_tracking.hef.par3 = 0.96F;
  } else if ((activity_type == -1.0F) && (b_bp_kodem < 2.4F)) {
    if (acc_run_flag == 0) {
      mega_bp_params.freq_tracking.tr_fi.p1 = 0.8F;
      mega_bp_params.freq_tracking.tr_fi.p2 = 1.7F;
      mega_bp_params.freq_tracking.hef.par3 = 0.985F;
    } else {
      mega_bp_params.freq_tracking.tr_fi.p1 = 0.97F;
      mega_bp_params.freq_tracking.tr_fi.p2 = 1.8F;
      mega_bp_params.freq_tracking.hef.par3 = 0.985F;
    }
  } else if ((SNR < -3.0F) && (activity_type >= 500.0F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.7F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.4F;
    mega_bp_params.freq_tracking.hef.par3 = 0.99F;
  } else if ((SNR > 3.5F) && (activity_type < 50000.0F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.8F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.5F;
    mega_bp_params.freq_tracking.hef.par3 = 0.975F;
  } else if ((SNR > 0.5F) && (activity_type < 5000.0F) && (b_bp_kodem > 2.7F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.5F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.2F;
    mega_bp_params.freq_tracking.hef.par3 = 0.97F;
  } else if ((SNR > 2.0F) && (activity_type < 4000.0F) && (b_bp_kodem > 2.3F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.6F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.16F;
    mega_bp_params.freq_tracking.hef.par3 = 0.98F;
  } else if ((SNR < -2.0F) && (activity_type != -1.0F) && (activity_type !=
              -1.5F) && (acc_run_flag == 0)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.7F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.3F;
    mega_bp_params.freq_tracking.hef.par3 = 0.99F;
  } else if ((SNR < -2.0F) && (activity_type < 500.0F) && (activity_type !=
              -1.0F) && (activity_type != -1.5F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.6F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.3F;
    mega_bp_params.freq_tracking.hef.par3 = 0.99F;
  } else if (acc_run_flag == 0) {
    if ((activity_type > 1.0E+7F) || (activity_type < 0.0F)) {
      mega_bp_params.freq_tracking.tr_fi.p1 = 0.85F;
      mega_bp_params.freq_tracking.tr_fi.p2 = 1.2F;
      mega_bp_params.freq_tracking.hef.par3 = 0.985F;
    } else {
      mega_bp_params.freq_tracking.tr_fi.p1 = 0.9F;
      mega_bp_params.freq_tracking.tr_fi.p2 = 1.1F;
      mega_bp_params.freq_tracking.hef.par3 = 0.99F;
    }
  } else {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.8F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.6F;
    mega_bp_params.freq_tracking.hef.par3 = 0.985F;
  }

  if ((SNR < 0.2F) && (activity_type == -2.0F)) {
    lom_f = mega_bp_params.freq_tracking.hef.par3 * 1.01F;
    if (lom_f > 1.0F) {
      mega_bp_params.freq_tracking.hef.par3 = 1.0F;
    } else {
      mega_bp_params.freq_tracking.hef.par3 = lom_f;
    }
  }

  if ((activity_type > 0.0F) && (activity_type < 1.0E+7F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.8F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.2F;
    mega_bp_params.freq_tracking.hef.par3 = 0.99F;
  } else if (acc_run_flag && (activity_type > 5.0E+7F)) {
    mega_bp_params.freq_tracking.tr_fi.p1 = 0.9F;
    mega_bp_params.freq_tracking.tr_fi.p2 = 1.9F;
    mega_bp_params.freq_tracking.hef.par3 = 0.99F;
  } else {
    if (acc_run_flag && (activity_type == -1.0F)) {
      mega_bp_params.freq_tracking.tr_fi.p1 = 0.9F;
      mega_bp_params.freq_tracking.tr_fi.p2 = 1.9F;
      mega_bp_params.freq_tracking.hef.par3 = 0.985F;
    }
  }

  b_chi2 = pad1 * pad1;
  for (i = 0; i < 4; i++) {
    vector1[4 - i] = vector1[3 - i];
  }

  vector1[0] = ppg_clean;
  if (hal_d > 0.0F) {
    tg = i_input_params_struct_freq_trac * tg + (1.0F -
      i_input_params_struct_freq_trac) * hal_d;
  }

  fv24[0] = mega_bp_params.freq_tracking.tr_fi.p1;
  fv24[1] = mega_bp_params.freq_tracking.tr_fi.p2;
  for (i = 0; i < 2; i++) {
    lims[i] = tg * fv24[i];
  }

  lims[1] = fminf(lims[1], k_input_params_struct_freq_trac);
  lims[0] = fmaxf(lims[0], j_input_params_struct_freq_trac);
  trk_3(lims, &lom_f, mek2);
  ppg_clean = lom_f * ((vector1[0] + vector1[4]) - 2.0F * vector1[2]);
  for (i = 0; i < 4; i++) {
    ppg_clean -= mek2[3 - i] * vector2[3 - i];
    if (4 - i > 1) {
      vector2[3 - i] = vector2[2 - i];
    } else {
      vector2[0] = ppg_clean;
    }
  }

  *bpf_s = ppg_clean;
  HBS = (HBS - HBS * taf / (del1 + taf * HBS * taf) * taf * HBS) / del1;
  del1 = mega_bp_params.freq_tracking.hef.par3 - 0.01F * (HBS - Pold);
  Pold = HBS;
  zavit += HBS * taf * (((-theta2 * zavit - b_chi2 * kefel[1]) + ppg_clean) +
                        vector_d[1]);
  rot_j = ((ppg_clean + vector_d[1]) - pad1 * pad1 * kefel[1]) - theta2 * zavit;
  dm = (rot_j - b_chi2 * mehir[1]) - pad1 * mehir[0] * zavit;
  lom_f = (ppg_clean - b_chi2 * vector_1_1[1]) - pad1 * vector_1_1[0] * zavit;
  theta2 = -ppg_clean + pad1 * rot_j;
  taf = -lom_f + pad1 * dm;
  kefel[1] = kefel[0];
  kefel[0] = rot_j;
  mehir[1] = mehir[0];
  mehir[0] = dm;
  vector_d[1] = vector_d[0];
  vector_d[0] = ppg_clean;
  vector_1_1[1] = vector_1_1[0];
  vector_1_1[0] = lom_f;
  pad1 = f_input_params_struct_freq_trac * pad1 + (1.0F -
    f_input_params_struct_freq_trac) * g_input_params_struct_freq_trac;
  if ((zavit > 2.0F) || (zavit < -2.0F)) {
    *freq = 1.0F;
  } else {
    *freq = acosf(-zavit / 2.0F) * (h_input_params_struct_freq_trac /
      3.14159274F / 2.0F);
    hal_d = *freq;
  }

  b_bp_kodem = *freq;
  trig_zav = trig_zav * 0.8F - 0.2F * zavit / 2.0F;
  vec_2_b[2] = vec_2_b[1];
  vec_2_b[1] = vec_2_b[0];
  vec_2_b[0] = ppg_clean;
  lom_f = 0.863271236F * ((vec_2_b[0] + vec_2_b[2]) + 2.0F * trig_zav *
    (vec_2_a[0] - vec_2_b[1])) - vec_2_a[1] * 0.726542532F;
  vec_2_a[1] = vec_2_a[0];
  vec_2_a[0] = lom_f;
  trig_zav = -zavit / 2.0F;
  shev_up = (1.0F - c_input_params_struct_snr_param) * (lom_f * lom_f) + shev_up
    * c_input_params_struct_snr_param;
  shev_dwn = (1.0F - c_input_params_struct_snr_param) * (vec_2_b[2] * vec_2_b[2])
    + shev_dwn * c_input_params_struct_snr_param;
  *snr = 10.0F * log10f(fabsf(shev_dwn / (shev_up + 2.22044605E-16F) - 1.0F));
  SNR = *snr;
  *freq = 60.0F * *freq + 0.5F;
}

static signed char debounce_bad_snr_flag(boolean_T bad_snr_flag, float
  snr_fft_new, boolean_T reset_flag)
{
  signed char bad_snr_flag_debounced;
  int window_length;
  if ((!cnt_1_not_empty) || reset_flag) {
    cnt_1 = 0.0F;
    cnt_1_not_empty = true;
    cnt_0 = 0.0F;
    first_time_cnt1 = false;
    first_time_cnt0 = false;
    bad_snr_flag_prev = (signed char)bad_snr_flag;
  }

  if (snr_fft_new < 20.0F) {
    window_length = 15;
  } else {
    window_length = 7;
  }

  if (bad_snr_flag == 1) {
    cnt_1++;
    cnt_0 = 0.0F;
  } else {
    cnt_0++;
    cnt_1 = 0.0F;
  }

  if (cnt_1 > (double)window_length * 10.0) {
    first_time_cnt1 = true;
    bad_snr_flag_debounced = 1;
  } else if (cnt_0 > (double)window_length * 10.0) {
    first_time_cnt0 = true;
    bad_snr_flag_debounced = 0;
  } else if (first_time_cnt0 || first_time_cnt1) {
    bad_snr_flag_debounced = bad_snr_flag_prev;
  } else {
    bad_snr_flag_debounced = -1;
  }

  bad_snr_flag_prev = bad_snr_flag_debounced;
  return bad_snr_flag_debounced;
}

static void eml_rand_init(void)
{
  method = 7U;
}

static void eml_rand_mcg16807_stateful_init(void)
{
  state = 1144108930U;
}

static double eml_rand_mt19937ar(unsigned int d_state[625])
{
  double r;
  int32_T exitg1;
  unsigned int u[2];
  int k;
  unsigned int mti;
  int kk;
  unsigned int y;
  unsigned int b_y;
  unsigned int c_y;
  unsigned int d_y;
  boolean_T isvalid;
  boolean_T exitg2;

  /* ========================= COPYRIGHT NOTICE ============================ */
  /*  This is a uniform (0,1) pseudorandom number generator based on:        */
  /*                                                                         */
  /*  A C-program for MT19937, with initialization improved 2002/1/26.       */
  /*  Coded by Takuji Nishimura and Makoto Matsumoto.                        */
  /*                                                                         */
  /*  Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,      */
  /*  All rights reserved.                                                   */
  /*                                                                         */
  /*  Redistribution and use in source and binary forms, with or without     */
  /*  modification, are permitted provided that the following conditions     */
  /*  are met:                                                               */
  /*                                                                         */
  /*    1. Redistributions of source code must retain the above copyright    */
  /*       notice, this list of conditions and the following disclaimer.     */
  /*                                                                         */
  /*    2. Redistributions in binary form must reproduce the above copyright */
  /*       notice, this list of conditions and the following disclaimer      */
  /*       in the documentation and/or other materials provided with the     */
  /*       distribution.                                                     */
  /*                                                                         */
  /*    3. The names of its contributors may not be used to endorse or       */
  /*       promote products derived from this software without specific      */
  /*       prior written permission.                                         */
  /*                                                                         */
  /*  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS    */
  /*  "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT      */
  /*  LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR  */
  /*  A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT  */
  /*  OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,  */
  /*  SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT       */
  /*  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,  */
  /*  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY  */
  /*  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT    */
  /*  (INCLUDING  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE */
  /*  OF THIS  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.  */
  /*                                                                         */
  /* =============================   END   ================================= */
  do {
    exitg1 = 0;
    for (k = 0; k < 2; k++) {
      mti = d_state[624] + 1U;
      if (mti >= 625U) {
        for (kk = 0; kk < 227; kk++) {
          y = (d_state[kk] & 2147483648U) | (d_state[1 + kk] & 2147483647U);
          if ((int)(y & 1U) == 0) {
            b_y = y >> 1U;
          } else {
            b_y = y >> 1U ^ 2567483615U;
          }

          d_state[kk] = d_state[397 + kk] ^ b_y;
        }

        for (kk = 0; kk < 396; kk++) {
          y = (d_state[227 + kk] & 2147483648U) | (d_state[228 + kk] &
            2147483647U);
          if ((int)(y & 1U) == 0) {
            c_y = y >> 1U;
          } else {
            c_y = y >> 1U ^ 2567483615U;
          }

          d_state[227 + kk] = d_state[kk] ^ c_y;
        }

        y = (d_state[623] & 2147483648U) | (d_state[0] & 2147483647U);
        if ((int)(y & 1U) == 0) {
          d_y = y >> 1U;
        } else {
          d_y = y >> 1U ^ 2567483615U;
        }

        d_state[623] = d_state[396] ^ d_y;
        mti = 1U;
      }

      y = d_state[(int)mti - 1];
      d_state[624] = mti;
      y ^= y >> 11U;
      y ^= y << 7U & 2636928640U;
      y ^= y << 15U & 4022730752U;
      y ^= y >> 18U;
      u[k] = y;
    }

    r = 1.1102230246251565E-16 * ((double)(u[0] >> 5U) * 6.7108864E+7 + (double)
                                  (u[1] >> 6U));
    if (r == 0.0) {
      if ((d_state[624] >= 1U) && (d_state[624] < 625U)) {
        isvalid = true;
      } else {
        isvalid = false;
      }

      if (isvalid) {
        isvalid = false;
        k = 1;
        exitg2 = false;
        while ((!exitg2) && (k < 625)) {
          if (d_state[k - 1] == 0U) {
            k++;
          } else {
            isvalid = true;
            exitg2 = true;
          }
        }
      }

      if (!isvalid) {
        twister_state_vector(d_state, 5489.0);
      }
    } else {
      exitg1 = 1;
    }
  } while (exitg1 == 0);

  return r;
}

static void eml_rand_shr3cong_stateful_init(void)
{
  int i2;
  for (i2 = 0; i2 < 2; i2++) {
    b_state[i2] = 362436069U + 158852560U * i2;
  }
}

static void fft4plot(const float sig[64], float Y[129])
{
  creal32_T y[256];
  int i;
  int ix;
  int ju;
  int iy;
  boolean_T tst;
  float temp_re;
  int iDelta;
  int iDelta2;
  int k;
  int iheight;
  float temp_im;
  static const float fv22[129] = { 0.0F, -0.024541229F, -0.0490676761F,
    -0.0735645667F, -0.0980171412F, -0.122410677F, -0.146730468F, -0.170961902F,
    -0.195090324F, -0.219101235F, -0.242980197F, -0.266712785F, -0.290284663F,
    -0.313681751F, -0.336889863F, -0.359895051F, -0.382683456F, -0.40524134F,
    -0.427555084F, -0.449611336F, -0.471396744F, -0.492898226F, -0.514102757F,
    -0.534997642F, -0.555570245F, -0.575808227F, -0.59569931F, -0.615231633F,
    -0.634393334F, -0.653172851F, -0.671559F, -0.689540565F, -0.707106769F,
    -0.724247098F, -0.740951121F, -0.757208824F, -0.773010433F, -0.78834641F,
    -0.803207517F, -0.817584813F, -0.831469595F, -0.84485358F, -0.857728601F,
    -0.870086968F, -0.881921232F, -0.893224299F, -0.903989315F, -0.914209723F,
    -0.923879504F, -0.932992816F, -0.941544056F, -0.949528158F, -0.956940353F,
    -0.963776052F, -0.970031261F, -0.975702107F, -0.980785251F, -0.985277653F,
    -0.989176512F, -0.992479563F, -0.99518472F, -0.997290432F, -0.99879545F,
    -0.999698818F, -1.0F, -0.999698818F, -0.99879545F, -0.997290432F,
    -0.99518472F, -0.992479563F, -0.989176512F, -0.985277653F, -0.980785251F,
    -0.975702107F, -0.970031261F, -0.963776052F, -0.956940353F, -0.949528158F,
    -0.941544056F, -0.932992816F, -0.923879504F, -0.914209723F, -0.903989315F,
    -0.893224299F, -0.881921232F, -0.870086968F, -0.857728601F, -0.84485358F,
    -0.831469595F, -0.817584813F, -0.803207517F, -0.78834641F, -0.773010433F,
    -0.757208824F, -0.740951121F, -0.724247098F, -0.707106769F, -0.689540565F,
    -0.671559F, -0.653172851F, -0.634393334F, -0.615231633F, -0.59569931F,
    -0.575808227F, -0.555570245F, -0.534997642F, -0.514102757F, -0.492898226F,
    -0.471396744F, -0.449611336F, -0.427555084F, -0.40524134F, -0.382683456F,
    -0.359895051F, -0.336889863F, -0.313681751F, -0.290284663F, -0.266712785F,
    -0.242980197F, -0.219101235F, -0.195090324F, -0.170961902F, -0.146730468F,
    -0.122410677F, -0.0980171412F, -0.0735645667F, -0.0490676761F, -0.024541229F,
    -0.0F };

  static const float fv23[129] = { 1.0F, 0.999698818F, 0.99879545F, 0.997290432F,
    0.99518472F, 0.992479563F, 0.989176512F, 0.985277653F, 0.980785251F,
    0.975702107F, 0.970031261F, 0.963776052F, 0.956940353F, 0.949528158F,
    0.941544056F, 0.932992816F, 0.923879504F, 0.914209723F, 0.903989315F,
    0.893224299F, 0.881921232F, 0.870086968F, 0.857728601F, 0.84485358F,
    0.831469595F, 0.817584813F, 0.803207517F, 0.78834641F, 0.773010433F,
    0.757208824F, 0.740951121F, 0.724247098F, 0.707106769F, 0.689540565F,
    0.671559F, 0.653172851F, 0.634393334F, 0.615231633F, 0.59569931F,
    0.575808227F, 0.555570245F, 0.534997642F, 0.514102757F, 0.492898226F,
    0.471396744F, 0.449611336F, 0.427555084F, 0.40524134F, 0.382683456F,
    0.359895051F, 0.336889863F, 0.313681751F, 0.290284663F, 0.266712785F,
    0.242980197F, 0.219101235F, 0.195090324F, 0.170961902F, 0.146730468F,
    0.122410677F, 0.0980171412F, 0.0735645667F, 0.0490676761F, 0.024541229F,
    0.0F, -0.024541229F, -0.0490676761F, -0.0735645667F, -0.0980171412F,
    -0.122410677F, -0.146730468F, -0.170961902F, -0.195090324F, -0.219101235F,
    -0.242980197F, -0.266712785F, -0.290284663F, -0.313681751F, -0.336889863F,
    -0.359895051F, -0.382683456F, -0.40524134F, -0.427555084F, -0.449611336F,
    -0.471396744F, -0.492898226F, -0.514102757F, -0.534997642F, -0.555570245F,
    -0.575808227F, -0.59569931F, -0.615231633F, -0.634393334F, -0.653172851F,
    -0.671559F, -0.689540565F, -0.707106769F, -0.724247098F, -0.740951121F,
    -0.757208824F, -0.773010433F, -0.78834641F, -0.803207517F, -0.817584813F,
    -0.831469595F, -0.84485358F, -0.857728601F, -0.870086968F, -0.881921232F,
    -0.893224299F, -0.903989315F, -0.914209723F, -0.923879504F, -0.932992816F,
    -0.941544056F, -0.949528158F, -0.956940353F, -0.963776052F, -0.970031261F,
    -0.975702107F, -0.980785251F, -0.985277653F, -0.989176512F, -0.992479563F,
    -0.99518472F, -0.997290432F, -0.99879545F, -0.999698818F, -1.0F };

  creal32_T x[129];
  for (i = 0; i < 256; i++) {
    y[i].re = 0.0F;
    y[i].im = 0.0F;
  }

  ix = 0;
  ju = 0;
  iy = 0;
  for (i = 0; i < 63; i++) {
    y[iy].re = sig[ix];
    y[iy].im = 0.0F;
    iy = 256;
    tst = true;
    while (tst) {
      iy >>= 1;
      ju ^= iy;
      tst = ((ju & iy) == 0);
    }

    iy = ju;
    ix++;
  }

  y[iy].re = sig[ix];
  y[iy].im = 0.0F;
  for (i = 0; i < 256; i += 2) {
    temp_re = y[i + 1].re;
    y[i + 1].re = y[i].re - y[i + 1].re;
    y[i + 1].im = 0.0F;
    y[i].re += temp_re;
    y[i].im = 0.0F;
  }

  iDelta = 2;
  iDelta2 = 4;
  k = 64;
  iheight = 253;
  while (k > 0) {
    for (i = 0; i < iheight; i += iDelta2) {
      iy = i + iDelta;
      temp_re = y[iy].re;
      temp_im = y[iy].im;
      y[i + iDelta].re = y[i].re - y[iy].re;
      y[i + iDelta].im = y[i].im - y[iy].im;
      y[i].re += temp_re;
      y[i].im += temp_im;
    }

    iy = 1;
    for (ix = k; ix < 128; ix += k) {
      i = iy;
      ju = iy + iheight;
      while (i < ju) {
        temp_re = fv23[ix] * y[i + iDelta].re - fv22[ix] * y[i + iDelta].im;
        temp_im = fv23[ix] * y[i + iDelta].im + fv22[ix] * y[i + iDelta].re;
        y[i + iDelta].re = y[i].re - temp_re;
        y[i + iDelta].im = y[i].im - temp_im;
        y[i].re += temp_re;
        y[i].im += temp_im;
        i += iDelta2;
      }

      iy++;
    }

    k /= 2;
    iDelta = iDelta2;
    iDelta2 <<= 1;
    iheight -= iDelta;
  }

  for (i = 0; i < 129; i++) {
    if (y[i].im == 0.0F) {
      x[i].re = y[i].re / 64.0F;
      x[i].im = 0.0F;
    } else if (y[i].re == 0.0F) {
      x[i].re = 0.0F;
      x[i].im = y[i].im / 64.0F;
    } else {
      x[i].re = y[i].re / 64.0F;
      x[i].im = y[i].im / 64.0F;
    }

    Y[i] = 2.0F * hypotf(x[i].re, x[i].im);
  }
}

static void filter(double b[5], double a[5], const double x[88], const double
                   zi[4], double y[88])
{
  double a1;
  int k;
  double dbuffer[5];
  int j;
  a1 = a[0];
  if ((a[0] == 0.0) || (!(a[0] != 1.0))) {
  } else {
    for (k = 0; k < 5; k++) {
      b[k] /= a[0];
    }

    for (k = 0; k < 4; k++) {
      a[k + 1] /= a1;
    }

    a[0] = 1.0;
  }

  for (k = 0; k < 4; k++) {
    dbuffer[k + 1] = zi[k];
  }

  for (j = 0; j < 88; j++) {
    for (k = 0; k < 4; k++) {
      dbuffer[k] = dbuffer[k + 1];
    }

    dbuffer[4] = 0.0;
    for (k = 0; k < 5; k++) {
      dbuffer[k] += x[j] * b[k];
    }

    for (k = 0; k < 4; k++) {
      dbuffer[k + 1] -= dbuffer[0] * a[k + 1];
    }

    y[j] = dbuffer[0];
  }
}

static void filtfilt(const double x_in[64], double y_out[64])
{
  double xtmp;
  double d0;
  int i;
  double y[88];
  double dv6[5];
  double dv7[5];
  static const double dv8[5] = { 0.1599878859752, 0.0, -0.3199757719504, 0.0,
    0.1599878859752 };

  static const double dv9[5] = { 1.0, -1.99366452600723, 1.67496287329374,
    -0.817913718158782, 0.234840483994864 };

  double a[4];
  static const double b_a[4] = { -0.15998788597519972, -0.15998788597520031,
    0.15998788597520017, 0.15998788597519992 };

  double b_y[88];
  double c_y[88];
  xtmp = 2.0 * x_in[0];
  d0 = 2.0 * x_in[63];
  for (i = 0; i < 12; i++) {
    y[i] = xtmp - x_in[12 - i];
  }

  memcpy(&y[12], &x_in[0], sizeof(double) << 6);
  for (i = 0; i < 12; i++) {
    y[i + 76] = d0 - x_in[62 - i];
  }

  for (i = 0; i < 5; i++) {
    dv6[i] = dv8[i];
    dv7[i] = dv9[i];
  }

  for (i = 0; i < 4; i++) {
    a[i] = b_a[i] * y[0];
  }

  memcpy(&b_y[0], &y[0], 88U * sizeof(double));
  filter(dv6, dv7, b_y, a, y);
  for (i = 0; i < 44; i++) {
    xtmp = y[i];
    y[i] = y[87 - i];
    y[87 - i] = xtmp;
  }

  for (i = 0; i < 5; i++) {
    dv6[i] = dv8[i];
    dv7[i] = dv9[i];
  }

  for (i = 0; i < 4; i++) {
    a[i] = b_a[i] * y[0];
  }

  memcpy(&c_y[0], &y[0], 88U * sizeof(double));
  filter(dv6, dv7, c_y, a, y);
  for (i = 0; i < 44; i++) {
    xtmp = y[i];
    y[i] = y[87 - i];
    y[87 - i] = xtmp;
  }

  memcpy(&y_out[0], &y[12], sizeof(double) << 6);
}

static void first_bp_calc(unsigned char b_fft_index, unsigned char
  b_original_ppg_buff_ind, unsigned char b_ppg_buff_first_loop_flag, float
  original_ppg, float activity_type, float max_reset_time, boolean_T
  reset_flag_hard, boolean_T reset_flag_soft, boolean_T har_val_flag, boolean_T
  b_bp_init_reset_flag, float *first_BP, boolean_T *first_bp_flag, float
  ppg_fft_nonmean1[18], boolean_T *dont_overide_bp)
{
  double bp_acc;
  float ValR;
  float fft_bp_snr;
  float ValL;
  float acc_time_nonmean[192];
  int i;
  unsigned char Ind;
  float ppg_time_nonmean[64];
  float acc_fft_nonmean[128];
  float acc_fft_nonmean1[18];
  int itmp;
  float fft_acc_snr;
  float MinFreq;
  float MaxFreq;
  unsigned char bp_init_thresh_bin;
  boolean_T guard1 = false;
  boolean_T guard2 = false;
  boolean_T guard3 = false;
  boolean_T guard4 = false;
  boolean_T guard5 = false;
  boolean_T guard6 = false;
  boolean_T guard7 = false;
  boolean_T guard8 = false;
  unsigned char Peaks_ppg[10];
  float ppg_fft_n[129];
  float ppg_fft_nonmean2[69];
  static const double dv3[69] = { 0.61848958333333337, 0.65104166666666674,
    0.68359375, 0.71614583333333337, 0.74869791666666674, 0.78125,
    0.81380208333333337, 0.84635416666666674, 0.87890625000000011,
    0.91145833333333337, 0.94401041666666674, 0.97656250000000011,
    1.0091145833333335, 1.0416666666666667, 1.07421875, 1.1067708333333335,
    1.1393229166666667, 1.171875, 1.2044270833333335, 1.2369791666666667,
    1.26953125, 1.3020833333333335, 1.3346354166666667, 1.3671875,
    1.3997395833333335, 1.4322916666666667, 1.46484375, 1.4973958333333335,
    1.5299479166666667, 1.5625, 1.5950520833333335, 1.6276041666666667,
    1.6601562500000002, 1.6927083333333335, 1.7252604166666667,
    1.7578125000000002, 1.7903645833333335, 1.8229166666666667,
    1.8554687500000002, 1.8880208333333335, 1.9205729166666667,
    1.9531250000000002, 1.9856770833333335, 2.018229166666667, 2.05078125,
    2.0833333333333335, 2.115885416666667, 2.1484375, 2.1809895833333335,
    2.213541666666667, 2.24609375, 2.2786458333333335, 2.311197916666667,
    2.34375, 2.3763020833333335, 2.408854166666667, 2.44140625,
    2.4739583333333335, 2.506510416666667, 2.5390625, 2.5716145833333335,
    2.604166666666667, 2.63671875, 2.6692708333333335, 2.701822916666667,
    2.734375, 2.7669270833333335, 2.799479166666667, 2.83203125 };

  double dv4[64];
  double dv5[64];
  float Max_Val;
  unsigned char max_mik;
  unsigned char b_i;
  boolean_T exitg2;
  boolean_T exitg1;
  float b_first_BP;
  int i1;
  boolean_T b0;
  *first_BP = 0.0F;
  *first_bp_flag = false;
  memset(&ppg_fft_nonmean1[0], 0, 18U * sizeof(float));
  *dont_overide_bp = false;
  if ((!inner_reset_not_empty) || reset_flag_hard || reset_flag_soft ||
      har_val_flag || b_bp_init_reset_flag) {
    flg_check_harm_5 = har_val_flag;
    if (reset_flag_hard || reset_flag_soft) {
      inner_reset = true;
    } else {
      inner_reset = false;
    }

    inner_reset_not_empty = true;
    bp_init_bin = 0;
    memset(&vectors_to_use[0], 0, sizeof(float) << 7);
    tot_count = 0;
    b_rst_index = 0;
    init_freq_test = 0.0F;
    if (reset_flag_soft || har_val_flag) {
      b_rst_index = 16;
    }

    if (reset_flag_hard) {
      b_rst_index = 0;
    }

    InitDone = false;
    act_level = 0.0F;
    IsActiveFlag = true;
    non_sat_flag = true;
    peaks_time_domain_flag = 0;
    peaks_time_domain_flag2 = 0;
    peaks_time_domain_flag_acc = 0;
    no_bp_found_counter = 0;
  }

  bp_acc = 0.0;
  if (b_original_ppg_buff_ind >= 32) {
    ValR = mean(*(float (*)[64])&vect_act_makor[0]);
    fft_bp_snr = mean(*(float (*)[64])&vect_act_makor[64]);
    ValL = mean(*(float (*)[64])&vect_act_makor[128]);
    for (i = 0; i < 64; i++) {
      acc_time_nonmean[i] = vect_act_makor[i] - ValR;
      acc_time_nonmean[64 + i] = vect_act_makor[64 + i] - fft_bp_snr;
      acc_time_nonmean[128 + i] = vect_act_makor[128 + i] - ValL;
    }

    for (Ind = b_original_ppg_buff_ind; Ind < 65; Ind++) {
      acc_time_nonmean[Ind - 1] = acc_time_nonmean[b_original_ppg_buff_ind - 1];
      acc_time_nonmean[Ind + 63] = acc_time_nonmean[b_original_ppg_buff_ind + 63];
      acc_time_nonmean[Ind + 127] = acc_time_nonmean[b_original_ppg_buff_ind +
        127];
    }

    sum(acc_time_nonmean, ppg_time_nonmean);
    for (i = 0; i < 64; i++) {
      acc_fft_nonmean[i] = ppg_time_nonmean[i];
      acc_fft_nonmean[64 + i] = 0.0F;
    }

    freq_analysis_raz(acc_fft_nonmean);
    memcpy(&acc_fft_nonmean1[0], &acc_fft_nonmean[5], 18U * sizeof(float));
    for (i = 0; i < 6; i++) {
      acc_fft_nonmean1[i] = 0.0F;
    }

    acc_fft_nonmean1[17] = 0.0F;
    fft_bp_snr = acc_fft_nonmean1[0];
    itmp = 0;
    for (i = 0; i < 17; i++) {
      if (acc_fft_nonmean1[i + 1] > fft_bp_snr) {
        fft_bp_snr = acc_fft_nonmean1[i + 1];
        itmp = i + 1;
      }
    }

    for (i = 0; i < 3; i++) {
      acc_fft_nonmean1[(i + itmp) - 1] = 0.0F;
    }

    ValL = acc_fft_nonmean1[0];
    for (i = 0; i < 17; i++) {
      if (acc_fft_nonmean1[i + 1] > ValL) {
        ValL = acc_fft_nonmean1[i + 1];
      }
    }

    fft_acc_snr = fft_bp_snr / ValL;
    bp_acc = 0.625 + 0.125 * (double)itmp;
    acc_run_flag = false;
    if (fft_acc_snr > 1.5F) {
      peaks_time_domain_flag_acc++;
      if (peaks_time_domain_flag_acc > 8) {
        acc_run_flag = true;
      }
    } else {
      peaks_time_domain_flag_acc = 0;
    }
  } else {
    fft_acc_snr = 0.0F;
  }

  if (activity_type > act_level) {
    act_level = activity_type;
  } else {
    if (activity_type < act_level / 2.0F) {
      act_level = activity_type;
    }
  }

  act_level /= 6.0F;
  if ((b_original_ppg_buff_ind >= 32) && (act_level < 50.0F)) {
    ValR = mean(vect_pleth_makor);
    for (i = 0; i < 64; i++) {
      ppg_time_nonmean[i] = vect_pleth_makor[i] - ValR;
    }

    for (Ind = b_original_ppg_buff_ind; Ind < 65; Ind++) {
      ppg_time_nonmean[Ind - 1] = ppg_time_nonmean[b_original_ppg_buff_ind - 1];
    }

    ValR = mean(ppg_time_nonmean);
    for (i = 0; i < 64; i++) {
      acc_fft_nonmean[i] = ppg_time_nonmean[i] - ValR;
      acc_fft_nonmean[64 + i] = 0.0F;
    }

    freq_analysis_raz(acc_fft_nonmean);
    memcpy(&ppg_fft_nonmean1[0], &acc_fft_nonmean[5], 18U * sizeof(float));
  }

  if (InitDone) {
    *first_bp_flag = true;
  } else {
    b_rst_index++;
    if (b_rst_index <= 16) {
    } else {
      if (b_rst_index > 1000) {
        b_rst_index = 1000;
      }

      if ((non_sat_flag && (original_ppg == 2.096921E+6F)) || (non_sat_flag &&
           (original_ppg == -2.096921E+6F))) {
      } else {
        if ((original_ppg < 2.096921E+6F) && (original_ppg > -2.096921E+6F)) {
          non_sat_flag = false;
        }

        if (act_level > 12000.0F) {
          MinFreq = 1.36F;
          MaxFreq = 2.8F;
          bp_init_thresh_bin = 30;
        } else if (act_level > 5000.0F) {
          MinFreq = 1.2F;
          MaxFreq = 2.8F;
          bp_init_thresh_bin = 20;
        } else if (act_level > 2000.0F) {
          MinFreq = 0.88F;
          MaxFreq = 2.8F;
          bp_init_thresh_bin = 15;
        } else if (act_level > 1000.0F) {
          MinFreq = 0.88F;
          MaxFreq = 2.8F;
          bp_init_thresh_bin = 9;
        } else if (act_level > 500.0F) {
          MinFreq = 0.72F;
          MaxFreq = 2.8F;
          bp_init_thresh_bin = 7;
        } else if (act_level > 100.0F) {
          MinFreq = 0.64F;
          MaxFreq = 2.16F;
          bp_init_thresh_bin = 5;
        } else {
          MinFreq = 0.5328F;
          MaxFreq = 2.08F;
          bp_init_thresh_bin = 4;
        }

        guard1 = false;
        guard2 = false;
        guard3 = false;
        guard4 = false;
        guard5 = false;
        guard6 = false;
        guard7 = false;
        guard8 = false;
        if (act_level < 1.0F) {
          fpeaks(vect_pleth_makor, 1, b_original_ppg_buff_ind, 1, Peaks_ppg,
                 &Ind);
          is_legal_bp_peaks(Peaks_ppg, Ind, act_level, b_original_ppg_buff_ind,
                            inner_reset, first_BP, &ValL);
          inner_reset = false;
          if ((*first_BP > 0.0F) && (((ValL < 0.55F) && (*first_BP <= 1.6F)) ||
               ((ValL < 0.3F) && (*first_BP <= 1.8F))) && (*first_BP >= MinFreq)
              && (act_level < 1500.0F)) {
            peaks_time_domain_flag++;
            if (peaks_time_domain_flag > 18) {
              *first_bp_flag = true;
              InitDone = true;
            } else {
              guard8 = true;
            }
          } else {
            peaks_time_domain_flag = 0;
            guard8 = true;
          }
        } else {
          guard8 = true;
        }

        if (guard8) {
          if ((b_original_ppg_buff_ind >= 40) && (act_level < 50.0F)) {
            ValR = mean(vect_pleth_makor);
            for (i = 0; i < 64; i++) {
              ppg_time_nonmean[i] = vect_pleth_makor[i] - ValR;
            }

            for (Ind = b_original_ppg_buff_ind; Ind < 65; Ind++) {
              ppg_time_nonmean[Ind - 1] =
                ppg_time_nonmean[b_original_ppg_buff_ind - 1];
            }

            fft4plot(ppg_time_nonmean, ppg_fft_n);
            fft_bp_snr = ppg_fft_n[19];
            itmp = 0;
            for (i = 0; i < 68; i++) {
              if (ppg_fft_n[i + 20] > fft_bp_snr) {
                fft_bp_snr = ppg_fft_n[i + 20];
                itmp = i + 1;
              }
            }

            memcpy(&ppg_fft_nonmean2[0], &ppg_fft_n[19], 69U * sizeof(float));
            if ((itmp + 1 > 1) && (itmp + 1 < 69)) {
              for (i = 0; i < 3; i++) {
                ppg_fft_nonmean2[(i + itmp) - 1] = 0.0F;
              }
            } else if (itmp + 1 < 69) {
              for (i = 0; i < 2; i++) {
                ppg_fft_nonmean2[i + itmp] = 0.0F;
              }
            } else {
              memset(&ppg_fft_nonmean2[0], 0, 69U * sizeof(float));
            }

            ValL = ppg_fft_nonmean2[0];
            for (i = 0; i < 68; i++) {
              if (ppg_fft_nonmean2[i + 1] > ValL) {
                ValL = ppg_fft_nonmean2[i + 1];
              }
            }

            fft_bp_snr /= ValL;
            if (((fft_bp_snr > 2.5F) && (act_level < 50.0F)) || ((fft_bp_snr >
                  1.8) && (act_level < 25.0F)) || ((fft_bp_snr > 1.5F) &&
                 (act_level < 5.0F)) || ((fft_bp_snr > 1.1) && (act_level < 1.0F)))
            {
              peaks_time_domain_flag2++;
              if (((peaks_time_domain_flag2 > 10) && (act_level < 50.0F) &&
                   (fft_bp_snr > 1.8)) || ((peaks_time_domain_flag2 > 7) &&
                   (act_level < 25.0F) && (fft_bp_snr > 1.8)) ||
                  ((peaks_time_domain_flag2 > 3) && (act_level < 5.0F) &&
                   (fft_bp_snr > 2.5F))) {
                *first_BP = (float)dv3[itmp];
                *first_bp_flag = true;
                InitDone = true;
                *dont_overide_bp = true;
              } else {
                guard7 = true;
              }
            } else {
              peaks_time_domain_flag2 = 0;
              guard7 = true;
            }
          } else {
            guard7 = true;
          }
        }

        if (guard7) {
          if (b_rst_index < 32) {
            IsActiveFlag = true;
          } else if (b_rst_index == 32) {
            IsActiveFlag = false;
          } else if ((act_level > 500.0F) || (b_rst_index > 100)) {
            IsActiveFlag = true;
          } else {
            if ((act_level < 80.0F) && (b_rst_index <= 100)) {
              IsActiveFlag = false;
            }
          }

          if (((act_level > 50.0F) && (fft_acc_snr > 1.1)) || (act_level >
               200.0F)) {
            IsActiveFlag = true;
          }

          tot_count++;
          if (!(b_ppg_buff_first_loop_flag != 0)) {
            Ind = 1;
          } else {
            Ind = (unsigned char)(b_fft_index + 1U);
          }

          for (i = 0; i < 64; i++) {
            if (IsActiveFlag) {
              vectors_to_use[i] = vect_ted_act[Ind - 1];
            } else {
              vectors_to_use[i] = vect_ted_men[Ind - 1];
            }

            vectors_to_use[64 + i] = 0.0F;
            Ind++;
            if (Ind == 65) {
              Ind = 1;
            }
          }

          for (i = 0; i < 64; i++) {
            dv4[i] = vectors_to_use[i];
          }

          filtfilt(dv4, dv5);
          for (i = 0; i < 64; i++) {
            vectors_to_use[i] = (float)dv5[i];
          }

          freq_analysis_raz(vectors_to_use);
          for (i = 0; i < 64; i++) {
            vectors_to_use[i] *= 150.0F;
          }

          fpeaks(*(float (*)[64])&vectors_to_use[0], 6, 28, 2, Peaks_ppg, &Ind);
          Max_Val = 0.0F;
          max_mik = 0;
          fft_acc_snr = 0.0F;
          for (b_i = 1; b_i <= Ind; b_i++) {
            if (vectors_to_use[Peaks_ppg[b_i - 1] - 1] > Max_Val) {
              fft_acc_snr = Max_Val;
              Max_Val = vectors_to_use[Peaks_ppg[b_i - 1] - 1];
              max_mik = b_i;
            } else {
              if ((vectors_to_use[Peaks_ppg[b_i - 1] - 1] > fft_acc_snr) &&
                  (vectors_to_use[Peaks_ppg[b_i - 1] - 1] != Max_Val)) {
                fft_acc_snr = vectors_to_use[Peaks_ppg[b_i - 1] - 1];
              }
            }
          }

          if (max_mik > 0) {
            max_mik = Peaks_ppg[max_mik - 1];
          }

          if (max_mik > 6) {
            fft_bp_snr = vectors_to_use[max_mik - 1];
            ValL = -1.0F;
            b_i = (unsigned char)(max_mik - 1);
            exitg2 = false;
            while ((!exitg2) && (b_i > 5)) {
              if (fft_bp_snr > vectors_to_use[b_i - 1]) {
                fft_bp_snr = vectors_to_use[b_i - 1];
                b_i--;
              } else {
                ValL = fft_bp_snr;
                exitg2 = true;
              }
            }

            if (ValL == -1.0F) {
              ValL = vectors_to_use[5];
            }
          } else {
            ValL = 1.0F;
          }

          if ((max_mik < 28) && (max_mik > 6)) {
            fft_bp_snr = vectors_to_use[max_mik - 1];
            ValR = -1.0F;
            b_i = (unsigned char)(max_mik + 1);
            exitg1 = false;
            while ((!exitg1) && (b_i < 29)) {
              if (fft_bp_snr > vectors_to_use[b_i - 1]) {
                fft_bp_snr = vectors_to_use[b_i - 1];
                b_i++;
              } else {
                ValR = fft_bp_snr;
                exitg1 = true;
              }
            }

            if (ValR == -1.0F) {
              ValR = vectors_to_use[27];
            }
          } else {
            ValR = 1.0F;
          }

          *first_BP = 0.125F * (float)(unsigned char)(max_mik - 6U) + 0.625F;
          ValL = Max_Val / ValL;
          ValR = Max_Val / ValR;
          fft_bp_snr = Max_Val / fft_acc_snr;
          if ((max_reset_time > 0.0F) && (b_rst_index > max_reset_time * 8.0F))
          {
            *first_bp_flag = true;
            InitDone = true;
          } else {
            if (flg_check_harm_5) {
              if (bp_init_thresh_bin <= 10) {
                bp_init_thresh_bin = (unsigned char)(bp_init_thresh_bin * 3);
              } else {
                bp_init_thresh_bin <<= 1;
              }
            } else {
              if ((*first_BP > 2.0F) && (bp_init_thresh_bin <= 10)) {
                bp_init_thresh_bin <<= 1;
              }
            }

            if ((bp_init_thresh_bin <= 35) && (*first_BP > 2.5F)) {
              bp_init_thresh_bin = 35;
            } else if ((bp_init_thresh_bin <= 18) && (*first_BP > 1.7F)) {
              bp_init_thresh_bin = 18;
            } else {
              if ((bp_init_thresh_bin <= 8) && (act_level < 500.0F)) {
                bp_init_thresh_bin = 8;
              }
            }

            if ((bp_init_thresh_bin <= 12) && (*first_BP > 0.9F) && (act_level <
                 1000.0F)) {
              bp_init_thresh_bin = 12;
            }

            if ((bp_init_thresh_bin <= 40) && (*first_BP > 2.0F) && (act_level >
                 30000.0F)) {
              bp_init_thresh_bin = 40;
            }

            if ((bp_init_thresh_bin <= 18) && (*first_BP > 1.3F) && (act_level <
                 3000.0F)) {
              bp_init_thresh_bin = 18;
              if (Max_Val < vectors_to_use[5] * 1.5F) {
                bp_init_thresh_bin = 30;
              }
            }

            if ((*first_BP <= 1.125F) && (bp_init_thresh_bin <= 40)) {
              bp_init_thresh_bin = 40;
            }

            if ((*first_BP == 0.75F) && (bp_init_thresh_bin <= 35)) {
              bp_init_thresh_bin = 35;
            }

            if ((fft_bp_snr < 1.8) && (bp_init_thresh_bin <= 18)) {
              bp_init_thresh_bin = 18;
            }

            if (*first_BP > 2.4) {
              bp_init_thresh_bin = 80;
            }

            if ((*first_BP <= 1.125F) && (Max_Val / vectors_to_use[5] < 1.5F) &&
                (bp_init_thresh_bin < 25)) {
              bp_init_thresh_bin = 25;
            }

            if (IsActiveFlag && (bp_init_thresh_bin < 70)) {
              bp_init_thresh_bin = 70;
            }

            if ((fabsf((float)bp_acc - *first_BP) < 0.16666666666666666) &&
                (bp_init_thresh_bin < 60)) {
              bp_init_thresh_bin = (unsigned char)rt_roundd((double)
                bp_init_thresh_bin * 1.5);
              if (bp_init_thresh_bin > 65) {
                bp_init_thresh_bin = 65;
              }
            }

            if ((ValL > 1.5F) && (ValR > 1.5F)) {
              if (*first_BP < 1.0F) {
                b_first_BP = 1.7F;
              } else {
                b_first_BP = 1.6F;
              }

              if (fft_bp_snr > b_first_BP) {
                if (act_level < 1000.0F) {
                  i1 = 600;
                } else {
                  i1 = 500;
                }

                if ((Max_Val > i1) && (*first_BP > MinFreq)) {
                  guard5 = true;
                } else {
                  guard6 = true;
                }
              } else {
                guard6 = true;
              }
            } else {
              guard6 = true;
            }
          }
        }

        if (guard6) {
          if (((ValL > 1.5F) && (ValR > 1.5F) && (fft_bp_snr > 1.1F) && (Max_Val
                > 1300.0F) && (*first_BP > 1.25F)) || ((ValL > 1.5F) && (ValR >
                1.5F) && (fft_bp_snr > 1.6F) && (Max_Val > 2500.0F) &&
               (*first_BP > 1.25F)) || (((ValL > 7.0F) || (ValR > 7.0F)) &&
               (fft_bp_snr > 1.6F) && (Max_Val > 1400.0F) && (*first_BP > 1.25F))
              || ((ValL > 3.0F) && (ValR > 3.0F) && (fft_bp_snr > 1.2F) &&
                  (Max_Val > 500.0F) && (*first_BP > 1.25F) && (*first_BP < 2.0F)
                  && (act_level < 50.0F)) || ((ValL > 1.5F) && (ValR > 1.5F) &&
               (fft_bp_snr > 1.7F) && (Max_Val > 1400.0F) && (*first_BP > 1.25F))
              || ((*first_BP <= 1.25F) && (Max_Val > 4500.0F) && (fft_bp_snr >
                1.3F)) || ((ValL > 1.5F) && (Max_Val > 2500.0F) && (fft_bp_snr >
                1.7F) && (*first_BP > 3.0F)) || ((ValL > 2.5F) && (ValR > 2.5F) &&
               (fft_bp_snr > 2.2F) && (Max_Val > 1500.0F) && (*first_BP <= 1.25F))
              || ((ValL > 3.5F) && (ValR > 3.5F) && (fft_bp_snr > 1.5F) &&
                  (Max_Val > 1600.0F) && (*first_BP <= 1.25F)) || ((ValL > 2.0F)
               && (ValR > 2.0F) && (fft_bp_snr > 1.5F) && (Max_Val > 550.0F) &&
               (*first_BP <= 1.25F) && (act_level < 30.0F)) || (((ValL > 6.0F) ||
                (ValR > 6.0F)) && (fft_bp_snr > 1.25F) && (Max_Val > 700.0F) &&
               (*first_BP <= 1.25F) && (act_level < 40.0F)) || (((ValL > 3.0F) ||
                (ValR > 3.0F)) && (fft_bp_snr > 1.25F) && (Max_Val > 2500.0F) &&
               (*first_BP <= 1.25F) && (act_level < 100.0F)) || ((ValL > 2.4F) &&
               (ValR > 2.5F) && (fft_bp_snr > 1.25F) && (Max_Val > 6000.0F) && (*
                first_BP <= 1.5F) && (act_level < 200.0F))) {
            guard5 = true;
          } else {
            guard1 = true;
          }
        }

        if (guard5) {
          if ((tot_count > 20) && ((*first_BP >= MinFreq) || ((*first_BP <
                 MinFreq) && (ValL > 2.5F) && (ValR > 2.5F) && (fft_bp_snr >
                 1.9F) && (Max_Val > 2000.0F))) && (*first_BP <= MaxFreq) &&
              (vectors_to_use[5] / Max_Val < 2.0F) && (Max_Val >=
               vectors_to_use[5])) {
            no_bp_found_counter = 0;
            if ((*first_BP == 0.75F) && (bp_init_thresh_bin <= 4)) {
              bp_init_thresh_bin = 8;
            }

            if (*first_BP <= 0.875F) {
              if ((((ValL > 3.0F) && (ValR > 2.0F)) || ((ValL > 1.5F) && (ValR >
                     4.5F))) && (fft_bp_snr > 1.8F) && (Max_Val > 2500.0F)) {
                b0 = true;
              } else {
                b0 = false;
              }

              if (!b0) {
              } else {
                guard4 = true;
              }
            } else {
              guard4 = true;
            }
          } else {
            guard1 = true;
          }
        }

        if (guard4) {
          if ((act_level > 1000.0F) && (*first_BP <= 0.875F)) {
            if ((ValL > 3.5F) && (ValR > 3.5F) && (fft_bp_snr > 3.0F) &&
                (Max_Val > 3500.0F)) {
              b0 = true;
            } else {
              b0 = false;
            }

            if (!b0) {
            } else {
              guard3 = true;
            }
          } else {
            guard3 = true;
          }
        }

        if (guard3) {
          if ((act_level > 3000.0F) && (*first_BP <= 1.0F)) {
            if ((ValL > 3.5F) && (ValR > 3.5F) && (fft_bp_snr > 3.2F) &&
                (Max_Val > 3500.0F)) {
              b0 = true;
            } else {
              b0 = false;
            }

            if (!b0) {
            } else {
              guard2 = true;
            }
          } else {
            guard2 = true;
          }
        }

        if (guard2) {
          if ((bp_init_bin == bp_init_thresh_bin) && (fabsf(*first_BP -
                init_freq_test) >= 0.25F)) {
            bp_init_bin = 0;
          }

          if (bp_init_bin < bp_init_thresh_bin) {
            if (fabsf(*first_BP - init_freq_test) >= 0.25F) {
              bp_init_bin = 0;
            }

            init_freq_test = *first_BP;
            bp_init_bin++;
          } else if (fabsf(*first_BP - init_freq_test) >= 0.25F) {
            bp_init_bin = 0;
            init_freq_test = *first_BP;
          } else {
            *first_bp_flag = true;
            InitDone = true;
            if (act_level < 20.0F) {
              *dont_overide_bp = true;
            }
          }
        }

        if (guard1) {
          no_bp_found_counter++;
          if (no_bp_found_counter > 24) {
            bp_init_bin = 0;
          }
        }
      }
    }
  }
}

static void fpeaks(const float x_in[64], unsigned char ind_start, unsigned char
                   ind_end, unsigned char mode, unsigned char mask_max2[10],
                   unsigned char *Counter_max2)
{
  float x[64];
  unsigned char mask_max[10];
  int i;
  unsigned char Counter_max;
  float bias;
  float slope;
  unsigned char b_i;
  int32_T exitg1;
  unsigned char mi1;
  unsigned char mi2;
  boolean_T term1;
  boolean_T term2;
  boolean_T guard1 = false;
  memcpy(&x[0], &x_in[0], sizeof(float) << 6);
  for (i = 0; i < 10; i++) {
    mask_max[i] = 0;
    mask_max2[i] = 0;
  }

  Counter_max = 0;
  if (1 >= ind_start) {
    ind_start = 1;
  }

  if (64 <= ind_end) {
    ind_end = 64;
  }

  if (mode == 1) {
    if (ind_end > 1) {
      bias = x_in[0];
      slope = (x_in[ind_end - 1] - x_in[0]) / ((float)ind_end - 1.0F);
    } else {
      bias = 0.0F;
      slope = 0.0F;
    }

    for (b_i = 1; b_i <= ind_end; b_i++) {
      x[b_i - 1] -= slope * ((float)b_i - 1.0F) + bias;
    }
  }

  b_i = ind_start;
  do {
    exitg1 = 0;
    if (b_i <= (unsigned char)(ind_end + 254U)) {
      if (x[b_i - 1] > x[(unsigned char)(b_i + 1U) - 1]) {
        mi1 = 1;
      } else {
        mi1 = 2;
      }

      if ((mi1 == 2) && (x[b_i] <= x[b_i + 1])) {
        mi1 = 3;
      }

      if (x_in[b_i - 1] > x_in[b_i]) {
        mi2 = 1;
      } else {
        mi2 = 2;
      }

      if ((mi2 == 2) && (x_in[b_i] <= x_in[b_i + 1])) {
        mi2 = 3;
      }

      if (mode == 1) {
        if ((((fabsf(x[b_i - 1] - x[b_i]) > 30.0F) || (fabsf(x[b_i] - x[b_i + 1])
               > 30.0F)) && (x[b_i] < 2.096921E+6F) && (x[b_i] > -2.096921E+6F))
            || ((fabsf(x[b_i - 1] - x[b_i]) > 10.0F) && (fabsf(x[b_i] - x[b_i +
               1]) > 30.0F) && (x[b_i] < 2.096921E+6F) && (x[b_i] >
              -2.096921E+6F)) || ((fabsf(x[b_i - 1] - x[b_i]) > 3.0F) && (fabsf
              (x[b_i] - x[b_i + 1]) > 15.0F) && (x[b_i] < 2.096921E+6F) &&
             (x[b_i] > -2.096921E+6F)) || ((fabsf(x[b_i - 1] - x[b_i]) > 15.0F) &&
             (fabsf(x[b_i] - x[b_i + 1]) > 3.0F) && (x[b_i] < 2.096921E+6F) &&
             (x[b_i] > -2.096921E+6F))) {
          term1 = true;
        } else {
          term1 = false;
        }

        if ((((fabsf(x_in[b_i - 1] - x_in[b_i]) > 30.0F) || (fabsf(x_in[b_i] -
                x_in[b_i + 1]) > 30.0F)) && (x_in[b_i] < 2.096921E+6F) &&
             (x_in[b_i] > -2.096921E+6F)) || ((fabsf(x_in[b_i - 1] - x_in[b_i]) >
              10.0F) && (fabsf(x_in[b_i] - x_in[b_i + 1]) > 10.0F) && (x_in[b_i]
              < 2.096921E+6F) && (x_in[b_i] > -2.096921E+6F)) || ((fabsf
              (x_in[b_i - 1] - x_in[b_i]) > 3.0F) && (fabsf(x_in[b_i] - x_in[b_i
               + 1]) > 15.0F) && (x_in[b_i] < 2.096921E+6F) && (x_in[b_i] >
              -2.096921E+6F)) || ((fabsf(x_in[b_i - 1] - x_in[b_i]) > 15.0F) &&
             (fabsf(x_in[b_i] - x_in[b_i + 1]) > 3.0F) && (x_in[b_i] <
              2.096921E+6F) && (x_in[b_i] > -2.096921E+6F))) {
          term2 = true;
        } else {
          term2 = false;
        }

        if ((mi1 == 2) && term1) {
          term1 = true;
          mi1 = 2;
        }

        if ((mi2 == 2) && term2) {
          term2 = true;
          mi1 = 2;
        }
      } else {
        term1 = (x[b_i - 1] > 0.0F);
        term2 = (x_in[b_i - 1] > 0.0F);
      }

      guard1 = false;
      if ((mi1 == 2) && (term1 || term2)) {
        Counter_max++;
        mask_max[Counter_max - 1] = (unsigned char)(b_i + 1);
        if (Counter_max == 10) {
          if (mode == 1) {
            i = 1;
            mask_max2[0] = mask_max[0];
            *Counter_max2 = 10;
            for (mi1 = 2; mi1 < 11; mi1++) {
              if ((unsigned char)((unsigned int)mask_max[mi1 - 1] - mask_max[mi1
                                  - 2]) > 2) {
                mask_max2[i] = mask_max[mi1 - 1];
                i++;
              } else {
                if (*Counter_max2 > 0) {
                  (*Counter_max2)--;
                }
              }
            }
          } else {
            *Counter_max2 = 10;
            for (i = 0; i < 10; i++) {
              mask_max2[i] = mask_max[i];
            }
          }

          exitg1 = 1;
        } else {
          guard1 = true;
        }
      } else {
        guard1 = true;
      }

      if (guard1) {
        b_i++;
      }
    } else {
      if (mode == 1) {
        i = 1;
        mask_max2[0] = mask_max[0];
        *Counter_max2 = Counter_max;
        for (b_i = 2; b_i <= Counter_max; b_i++) {
          if ((unsigned char)((unsigned int)mask_max[b_i - 1] - mask_max[b_i - 2])
              > 2) {
            mask_max2[i] = mask_max[b_i - 1];
            i++;
          } else {
            if (*Counter_max2 > 0) {
              (*Counter_max2)--;
            }
          }
        }
      } else {
        *Counter_max2 = Counter_max;
        for (i = 0; i < 10; i++) {
          mask_max2[i] = mask_max[i];
        }
      }

      exitg1 = 1;
    }
  } while (exitg1 == 0);
}

static void fpeaks2(const float x_in[50], unsigned char ind_end, unsigned char
                    mask_max2[10], unsigned char *Counter_max2, float peaks_dc
                    [10])
{
  float x[50];
  unsigned char mask_max[10];
  int i;
  unsigned char Counter_max;
  float bias;
  float slope;
  unsigned char b_i;
  int32_T exitg1;
  unsigned char mi1;
  unsigned char mi2;
  boolean_T term1;
  boolean_T term2;
  boolean_T b_b1;
  boolean_T guard1 = false;
  memcpy(&x[0], &x_in[0], 50U * sizeof(float));
  for (i = 0; i < 10; i++) {
    mask_max[i] = 0;
    mask_max2[i] = 0;
    peaks_dc[i] = 0.0F;
  }

  Counter_max = 0;
  if (ind_end > 1) {
    bias = x_in[0];
    slope = (x_in[ind_end - 1] - x_in[0]) / ((float)ind_end - 1.0F);
  } else {
    bias = 0.0F;
    slope = 0.0F;
  }

  for (b_i = 1; b_i <= ind_end; b_i++) {
    x[b_i - 1] -= slope * ((float)b_i - 1.0F) + bias;
  }

  b_i = 1;
  do {
    exitg1 = 0;
    if (b_i <= (unsigned char)(ind_end + 254U)) {
      if (x[b_i - 1] > x[b_i]) {
        mi1 = 1;
      } else {
        mi1 = 2;
      }

      if ((mi1 == 2) && (x[b_i] <= x[b_i + 1])) {
        mi1 = 3;
      }

      if (x_in[b_i - 1] > x_in[b_i]) {
        mi2 = 1;
      } else {
        mi2 = 2;
      }

      if ((mi2 == 2) && (x_in[b_i] <= x_in[b_i + 1])) {
        mi2 = 3;
      }

      if ((((fabsf(x[b_i - 1] - x[b_i]) > 0.1) || (fabsf(x[b_i] - x[b_i + 1]) >
             0.1)) && (x[b_i] < 2.096921E+6F) && (x[b_i] > -2.096921E+6F)) ||
          ((fabsf(x[b_i - 1] - x[b_i]) > 0.033333333333333333) && (fabsf(x[b_i]
             - x[b_i + 1]) > 0.1) && (x[b_i] < 2.096921E+6F) && (x[b_i] >
            -2.096921E+6F)) || ((fabsf(x[b_i - 1] - x[b_i]) > 0.01) && (fabsf
            (x[b_i] - x[b_i + 1]) > 0.05) && (x[b_i] < 2.096921E+6F) && (x[b_i] >
            -2.096921E+6F)) || ((fabsf(x[b_i - 1] - x[b_i]) > 0.05) && (fabsf
            (x[b_i] - x[b_i + 1]) > 0.01) && (x[b_i] < 2.096921E+6F) && (x[b_i] >
            -2.096921E+6F))) {
        term1 = true;
      } else {
        term1 = false;
      }

      if ((((fabsf(x_in[b_i - 1] - x_in[b_i]) > 0.1) || (fabsf(x_in[b_i] -
              x_in[b_i + 1]) > 0.1)) && (x_in[b_i] < 2.096921E+6F) && (x_in[b_i]
            > -2.096921E+6F)) || ((fabsf(x_in[b_i - 1] - x_in[b_i]) >
            0.033333333333333333) && (fabsf(x_in[b_i] - x_in[b_i + 1]) >
            0.033333333333333333) && (x_in[b_i] < 2.096921E+6F) && (x_in[b_i] >
            -2.096921E+6F)) || ((fabsf(x_in[b_i - 1] - x_in[b_i]) > 0.01) &&
           (fabsf(x_in[b_i] - x_in[b_i + 1]) > 0.05) && (x_in[b_i] <
            2.096921E+6F) && (x_in[b_i] > -2.096921E+6F)) || ((fabsf(x_in[b_i -
             1] - x_in[b_i]) > 0.05) && (fabsf(x_in[b_i] - x_in[b_i + 1]) > 0.01)
           && (x_in[b_i] < 2.096921E+6F) && (x_in[b_i] > -2.096921E+6F))) {
        term2 = true;
      } else {
        term2 = false;
      }

      if ((x_in[b_i + 1] < x_in[b_i]) && (x_in[b_i] > x_in[b_i - 1]) &&
          (x_in[b_i] > 0.0F)) {
        b_b1 = true;
      } else {
        b_b1 = false;
      }

      if ((mi1 == 2) && term1 && b_b1) {
        term1 = true;
        mi1 = 2;
      }

      if ((mi2 == 2) && term2 && b_b1) {
        term2 = true;
        mi1 = 2;
      }

      guard1 = false;
      if ((mi1 == 2) && (term1 || term2) && b_b1) {
        Counter_max++;
        mask_max[Counter_max - 1] = (unsigned char)(b_i + 1);
        peaks_dc[Counter_max - 1] = x_in[b_i];
        if (Counter_max == 10) {
          i = 1;
          mask_max2[0] = mask_max[0];
          *Counter_max2 = 10;
          for (mi1 = 2; mi1 < 11; mi1++) {
            if ((unsigned char)((unsigned int)mask_max[mi1 - 1] - mask_max[mi1 -
                                2]) > 2) {
              mask_max2[i] = mask_max[mi1 - 1];
              i++;
            } else {
              if (*Counter_max2 > 0) {
                (*Counter_max2)--;
              }
            }
          }

          for (i = 0; i < 9; i++) {
            if (mask_max2[1 + i] == 0) {
              mask_max2[1 + i] = mask_max2[i];
            }
          }

          for (i = 0; i < 10; i++) {
            peaks_dc[i] = x_in[mask_max2[i] - 1];
          }

          exitg1 = 1;
        } else {
          guard1 = true;
        }
      } else {
        guard1 = true;
      }

      if (guard1) {
        b_i++;
      }
    } else {
      i = 1;
      mask_max2[0] = mask_max[0];
      *Counter_max2 = Counter_max;
      for (b_i = 2; b_i <= Counter_max; b_i++) {
        if ((unsigned char)((unsigned int)mask_max[b_i - 1] - mask_max[b_i - 2])
            > 2) {
          mask_max2[i] = mask_max[b_i - 1];
          i++;
        } else {
          if (*Counter_max2 > 0) {
            (*Counter_max2)--;
          }
        }
      }

      exitg1 = 1;
    }
  } while (exitg1 == 0);
}

static void freq_analysis_raz(float x[128])
{
  short j;
  short i;
  float temp[2];
  int n;
  float b_x[2];
  short k;
  static const signed char iv0[6] = { 32, 16, 8, 4, 2, 1 };

  short i3;
  static const signed char iv1[6] = { 1, 2, 4, 8, 16, 32 };

  short i4;
  static const signed char iv2[6] = { 2, 4, 8, 16, 32, 64 };

  static const float w[126] = { 1.0F, 1.0F, 6.12323426E-17F, 1.0F, 0.707106769F,
    6.12323426E-17F, -0.707106769F, 1.0F, 0.923879504F, 0.707106769F,
    0.382683426F, 6.12323426E-17F, -0.382683426F, -0.707106769F, -0.923879504F,
    1.0F, 0.980785251F, 0.923879504F, 0.831469595F, 0.707106769F, 0.555570245F,
    0.382683426F, 0.195090324F, 6.12323426E-17F, -0.195090324F, -0.382683426F,
    -0.555570245F, -0.707106769F, -0.831469595F, -0.923879504F, -0.980785251F,
    1.0F, 0.99518472F, 0.980785251F, 0.956940353F, 0.923879504F, 0.881921291F,
    0.831469595F, 0.773010433F, 0.707106769F, 0.634393275F, 0.555570245F,
    0.471396744F, 0.382683426F, 0.290284663F, 0.195090324F, 0.0980171412F,
    6.12323426E-17F, -0.0980171412F, -0.195090324F, -0.290284663F, -0.382683426F,
    -0.471396744F, -0.555570245F, -0.634393275F, -0.707106769F, -0.773010433F,
    -0.831469595F, -0.881921291F, -0.923879504F, -0.956940353F, -0.980785251F,
    -0.99518472F, 0.0F, 0.0F, -1.0F, 0.0F, -0.707106769F, -1.0F, -0.707106769F,
    0.0F, -0.382683426F, -0.707106769F, -0.923879504F, -1.0F, -0.923879504F,
    -0.707106769F, -0.382683426F, 0.0F, -0.195090324F, -0.382683426F,
    -0.555570245F, -0.707106769F, -0.831469595F, -0.923879504F, -0.980785251F,
    -1.0F, -0.980785251F, -0.923879504F, -0.831469595F, -0.707106769F,
    -0.555570245F, -0.382683426F, -0.195090324F, 0.0F, -0.0980171412F,
    -0.195090324F, -0.290284663F, -0.382683426F, -0.471396744F, -0.555570245F,
    -0.634393275F, -0.707106769F, -0.773010433F, -0.831469595F, -0.881921291F,
    -0.923879504F, -0.956940353F, -0.980785251F, -0.99518472F, -1.0F,
    -0.99518472F, -0.980785251F, -0.956940353F, -0.923879504F, -0.881921291F,
    -0.831469595F, -0.773010433F, -0.707106769F, -0.634393275F, -0.555570245F,
    -0.471396744F, -0.382683426F, -0.290284663F, -0.195090324F, -0.0980171412F };

  float temp_idx_0;
  float temp_idx_1;
  j = 1;
  for (i = 0; i < 63; i++) {
    if (i + 1 < j) {
      for (n = 0; n < 2; n++) {
        temp[n] = x[(j + (n << 6)) - 1];
      }

      for (n = 0; n < 2; n++) {
        b_x[n] = x[i + (n << 6)];
      }

      for (n = 0; n < 2; n++) {
        x[(j + (n << 6)) - 1] = b_x[n];
      }

      for (n = 0; n < 2; n++) {
        x[i + (n << 6)] = temp[n];
      }
    }

    k = 32;
    while (k < j) {
      j -= k;
      k >>= 1;
    }

    j += k;
  }

  for (i = 0; i < 6; i++) {
    i3 = (short)(iv0[i] - 1);
    for (k = 0; k <= i3; k++) {
      i4 = (short)(iv1[i] - 1);
      for (j = 0; j <= i4; j++) {
        temp_idx_0 = w[(iv1[i] + j) - 1] * x[(k * iv2[i] + j) + iv1[i]] - w
          [(iv1[i] + j) + 62] * x[64 + ((k * iv2[i] + j) + iv1[i])];
        temp_idx_1 = w[(iv1[i] + j) - 1] * x[64 + ((k * iv2[i] + j) + iv1[i])] +
          w[(iv1[i] + j) + 62] * x[(k * iv2[i] + j) + iv1[i]];
        x[(k * iv2[i] + j) + iv1[i]] = x[k * iv2[i] + j] - temp_idx_0;
        x[64 + ((k * iv2[i] + j) + iv1[i])] = x[64 + (k * iv2[i] + j)] -
          temp_idx_1;
        x[k * iv2[i] + j] += temp_idx_0;
        x[64 + (k * iv2[i] + j)] += temp_idx_1;
      }
    }
  }

  for (n = 0; n < 64; n++) {
    x[n] = fabsf(x[n]) + fabsf(x[64 + n]);
    x[64 + n] = 0.0F;
  }
}

static void init_filtering(const float in[4], float
  c_input_params_struct_pre_filte, float d_input_params_struct_pre_filte, float
  e_input_params_struct_pre_filte, float f_input_params_struct_pre_filte, float
  g_input_params_struct_pre_filte, float h_input_params_struct_pre_filte, float
  i_input_params_struct_pre_filte, boolean_T input_params_struct_r_f_h_h, float *
  ppg_clean, float *ppg_bpf, float *acc_recursive_std, float *ppg_recursive_std,
  float *ppg, float *pleth_lif_mar, float *sheerit_mar)
{
  int i;
  float inner_ag_ff;
  float agc_ff;
  float fv19[6];
  int n;
  float fv20[3];
  float acc[3];
  float A1;
  float A2[3];
  float K[19];
  static const float fv21[19] = { -0.181323886F, -0.675203F, 0.7562446F,
    0.650011957F, -0.845421731F, 1.92348206F, -0.672686219F, -0.431231081F,
    -0.427554429F, -0.0480035767F, 0.738652468F, -0.576907277F, -0.000828216F,
    0.0194175411F, -0.00431376696F, 0.0323610492F, -0.0438510552F,
    -0.0256884042F, 0.30525434F };

  int m;
  unsigned short b_i;
  *ppg = in[0];
  if ((!noc_not_empty) || input_params_struct_r_f_h_h) {
    gcpf = 0;
    noc_not_empty = true;
    for (i = 0; i < 3; i++) {
      ppg_vec2[i] = 0.0F;
    }

    for (i = 0; i < 9; i++) {
      acc_vec2[i] = 0.0F;
    }

    for (i = 0; i < 2; i++) {
      ppg_vec1[i] = 0.0F;
    }

    for (i = 0; i < 6; i++) {
      acc_vec1[i] = 0.0F;
    }

    for (i = 0; i < 10; i++) {
      sig_res_1[i] = 0.0F;
      sig_res_2[i] = 0.0F;
    }
  }

  gcpf++;
  if (gcpf < 40) {
    inner_ag_ff = d_input_params_struct_pre_filte;
  } else if (gcpf < 80) {
    inner_ag_ff = e_input_params_struct_pre_filte;
  } else if (gcpf < 120) {
    inner_ag_ff = f_input_params_struct_pre_filte;
  } else if (gcpf < 180) {
    inner_ag_ff = g_input_params_struct_pre_filte;
  } else if (gcpf < 220) {
    inner_ag_ff = h_input_params_struct_pre_filte;
  } else {
    inner_ag_ff = i_input_params_struct_pre_filte;
  }

  if (gcpf > 1000) {
    gcpf = 1000;
  }

  if (gcpf < 17) {
    agc_ff = 0.01F;
  } else {
    agc_ff = 0.8F;
  }

  ppg_vec2[2] = ppg_vec2[1];
  ppg_vec2[1] = ppg_vec2[0];
  ppg_vec2[0] = in[0];
  *ppg_bpf = -(ppg_vec1[0] * -1.561F + ppg_vec1[1] * 0.6414F) + ((ppg_vec2[0] +
    ppg_vec2[2]) * 0.8006F + ppg_vec2[1] * -1.6012F);
  ppg_vec1[1] = ppg_vec1[0];
  ppg_vec1[0] = *ppg_bpf;
  for (i = 0; i < 2; i++) {
    for (n = 0; n < 3; n++) {
      fv19[n + 3 * i] = acc_vec2[n + 3 * i];
    }
  }

  for (i = 0; i < 2; i++) {
    for (n = 0; n < 3; n++) {
      acc_vec2[n + 3 * (1 + i)] = fv19[n + 3 * i];
    }
  }

  for (i = 0; i < 3; i++) {
    acc_vec2[i] = in[1 + i];
    fv20[i] = acc_vec1[i];
  }

  acc[0] = -(acc_vec1[0] * -1.561F + acc_vec1[3] * 0.6414F) + ((acc_vec2[0] +
    acc_vec2[6]) * 0.8006F + acc_vec2[3] * -1.6012F);
  acc[1] = -(acc_vec1[1] * -1.561F + acc_vec1[4] * 0.6414F) + ((acc_vec2[1] +
    acc_vec2[7]) * 0.8006F + acc_vec2[4] * -1.6012F);
  acc[2] = -(acc_vec1[2] * -1.561F + acc_vec1[5] * 0.6414F) + ((acc_vec2[2] +
    acc_vec2[8]) * 0.8006F + acc_vec2[5] * -1.6012F);
  A1 = *ppg_bpf * *ppg_bpf;
  for (i = 0; i < 3; i++) {
    acc_vec1[3 + i] = fv20[i];
    acc_vec1[i] = acc[i];
    A2[i] = acc[i] * acc[i];
  }

  if ((!ppg_f_v_not_empty) || input_params_struct_r_f_h_h) {
    ppg_f_v = A1;
    ppg_f_v_not_empty = true;
    for (i = 0; i < 3; i++) {
      acc_f_v[i] = A2[i];
    }
  }

  ppg_f_v = (1.0F - agc_ff) * A1 + agc_ff * ppg_f_v;
  for (i = 0; i < 3; i++) {
    acc_f_v[i] = (1.0F - agc_ff) * A2[i] + agc_ff * acc_f_v[i];
    A2[i] = acc_f_v[i] * acc_f_v[i];
  }

  agc_ff = A2[0];
  for (i = 0; i < 2; i++) {
    agc_ff += A2[i + 1];
  }

  *acc_recursive_std = sqrtf(agc_ff);
  *ppg_recursive_std = sqrtf(ppg_f_v * ppg_f_v);
  *ppg_bpf /= sqrtf(ppg_f_v + 2.2204E-16F);
  for (i = 0; i < 3; i++) {
    acc[i] /= sqrtf(acc_f_v[i] + 2.2204E-16F);
  }

  *pleth_lif_mar = *ppg_bpf * 6.0F;
  memset(&K[0], 0, 19U * sizeof(float));
  if ((!kl_not_empty) || input_params_struct_r_f_h_h) {
    tmp = 0.0F;
    memcpy(&kl[0], &fv21[0], 19U * sizeof(float));
    kl_not_empty = true;
    nun_f = 0.0F;
    memset(&B_M_Y[0], 0, 361U * sizeof(float));
    for (n = 0; n < 19; n++) {
      B_M_Y[n + 19 * n] = c_input_params_struct_pre_filte;
      feat_vec[n] = 0.0F;
    }
  }

  feat_vec[18] = nun_f;
  for (n = 0; n < 3; n++) {
    feat_vec[15 + n] = feat_vec[n] * nun_f;
    feat_vec[12 + n] = acc[n] * nun_f;
    feat_vec[9 + n] = feat_vec[6 + n];
    feat_vec[6 + n] = feat_vec[3 + n];
    feat_vec[3 + n] = feat_vec[n];
    feat_vec[n] = acc[n];
  }

  agc_ff = 0.0F;
  A1 = mega_bp_params.pre_filter.rl_ff;
  for (n = 0; n < 19; n++) {
    agc_ff += feat_vec[n] * kl[n];
    for (m = 0; m < 19; m++) {
      K[n] += B_M_Y[n + 19 * m] * feat_vec[m];
    }

    A1 += feat_vec[n] * K[n];
  }

  *sheerit_mar = *pleth_lif_mar - agc_ff;
  agc_ff = 0.0F;
  for (m = 0; m < 19; m++) {
    for (n = 0; n < 19; n++) {
      if (1 + m == 1) {
        K[n] /= A1;
      }

      if (1 + n == 1) {
        tmp = 0.0F;
        for (i = 0; i < 19; i++) {
          tmp += feat_vec[i] * B_M_Y[i + 19 * m];
        }
      }

      B_M_Y[n + 19 * m] = (B_M_Y[n + 19 * m] - K[n] * tmp) /
        mega_bp_params.pre_filter.rl_ff;
    }

    kl[m] += K[m] * *sheerit_mar;
    agc_ff += feat_vec[m] * kl[m];
  }

  *sheerit_mar = *pleth_lif_mar - agc_ff;
  nun_f = *pleth_lif_mar;
  if ((!pop1_not_empty) || input_params_struct_r_f_h_h) {
    pop1 = fabsf(*sheerit_mar);
    pop1_not_empty = true;
  }

  for (b_i = 10; b_i > 1; b_i--) {
    sig_res_1[b_i - 1] = sig_res_1[b_i - 2];
    sig_res_2[b_i - 1] = sig_res_2[b_i - 2];
  }

  sig_res_1[0] = *sheerit_mar;
  if (*sheerit_mar >= 0.0F) {
    sig_res_2[0] = *sheerit_mar;
  } else {
    sig_res_2[0] = -*sheerit_mar;
  }

  agc_ff = sig_res_2[0];
  for (i = 0; i < 9; i++) {
    if (sig_res_2[i + 1] > agc_ff) {
      agc_ff = sig_res_2[i + 1];
    }
  }

  if (agc_ff < 1.0F) {
    agc_ff = 1.0F;
  }

  pop1 = inner_ag_ff * pop1 + (1.0F - inner_ag_ff) * agc_ff;
  *ppg_clean = sig_res_1[9] / pop1;
}

static void is_legal_bp_peaks(unsigned char Peaks_ppg[10], unsigned char
  num_peaks_ppg, float b_act_level, unsigned char b_original_ppg_buff_ind,
  boolean_T reset_flag, float *BP_out, float *mega_var)
{
  unsigned short mega_mean;
  int c_act_level;
  unsigned char i;
  float my_mean2;
  unsigned char u0;
  if ((!noise_flag_not_empty) || reset_flag) {
    noise_flag = false;
    noise_flag_not_empty = true;
  }

  mega_mean = 0;
  *mega_var = 0.0F;
  if (b_act_level < 2.0F) {
    c_act_level = 5;
  } else {
    c_act_level = 6;
  }

  if (num_peaks_ppg >= c_act_level) {
    for (i = 2; i <= num_peaks_ppg; i++) {
      if (((unsigned char)((unsigned int)Peaks_ppg[i - 1] - Peaks_ppg[i - 2]) <=
           3) && (i >= 3) && (!noise_flag)) {
        Peaks_ppg[i - 2] = Peaks_ppg[i - 3];
        noise_flag = true;
      } else {
        Peaks_ppg[i - 2] = (unsigned char)((unsigned int)Peaks_ppg[i - 1] -
          Peaks_ppg[i - 2]);
      }

      if (i < num_peaks_ppg) {
        mega_mean = (unsigned short)((unsigned int)mega_mean + Peaks_ppg[i - 2]);
      }
    }

    my_mean2 = (float)mega_mean / ((float)num_peaks_ppg - 2.0F);
    u0 = (unsigned char)(num_peaks_ppg - 2);
    for (i = 1; i <= u0; i++) {
      *mega_var += ((float)Peaks_ppg[i - 1] - my_mean2) * ((float)Peaks_ppg[i -
        1] - my_mean2);
    }

    *mega_var /= (float)num_peaks_ppg - 3.0F;
    if (*mega_var < 1.4F) {
      *BP_out = 8.0F / my_mean2;
    } else {
      *BP_out = 0.0F;
    }

    if ((b_original_ppg_buff_ind < 40) && noise_flag) {
      *BP_out = 0.0F;
    }
  } else {
    *BP_out = 0.0F;
  }

  if ((*BP_out > 1.3F) && (Peaks_ppg[9] == 0) && (Peaks_ppg[8] == 0) &&
      (Peaks_ppg[7] == 0)) {
    *BP_out = 0.0F;
  }
}

static float mean(const float x[64])
{
  float y;
  int k;
  y = x[0];
  for (k = 0; k < 63; k++) {
    y += x[k + 1];
  }

  y /= 64.0F;
  return y;
}

static float rdivide(float x, float y)
{
  return x / y;
}

static double rt_roundd(double u)
{
  double y;
  if (fabs(u) < 4.503599627370496E+15) {
    if (u >= 0.5) {
      y = floor(u + 0.5);
    } else if (u > -0.5) {
      y = 0.0;
    } else {
      y = ceil(u - 0.5);
    }
  } else {
    y = u;
  }

  return y;
}

static void set_initial_parameters(boolean_T reset_flag, float
  *bp_algo_params_pre_filter_f_l, float c_bp_algo_params_pre_filter_acc[3],
  float *bp_algo_params_pre_filter_conf, float *c_bp_algo_params_pre_filter_ag_,
  float *d_bp_algo_params_pre_filter_ag_, float *e_bp_algo_params_pre_filter_ag_,
  float *f_bp_algo_params_pre_filter_ag_, float *g_bp_algo_params_pre_filter_ag_,
  float *h_bp_algo_params_pre_filter_ag_, g_struct_T
  *bp_algo_params_freq_tracking, h_struct_T *bp_algo_params_snr_params, float
  *bp_algo_params_max_reset_time, boolean_T *bp_algo_params_r_f_h_h, boolean_T
  *bp_algo_params_r_f_h_s)
{
  int i0;
  *bp_algo_params_pre_filter_f_l = 6.0F;
  for (i0 = 0; i0 < 3; i0++) {
    c_bp_algo_params_pre_filter_acc[i0] = 1.0F + (float)i0;
  }

  *bp_algo_params_pre_filter_conf = 0.1F;
  *c_bp_algo_params_pre_filter_ag_ = 0.999F;
  *d_bp_algo_params_pre_filter_ag_ = 0.97F;
  *e_bp_algo_params_pre_filter_ag_ = 0.95F;
  *f_bp_algo_params_pre_filter_ag_ = 0.93F;
  *g_bp_algo_params_pre_filter_ag_ = 0.91F;
  *h_bp_algo_params_pre_filter_ag_ = 0.9F;
  bp_algo_params_freq_tracking->f1 = 2.3F;
  bp_algo_params_freq_tracking->f2 = 1.0F;
  bp_algo_params_freq_tracking->pad1 = 0.4F;
  bp_algo_params_freq_tracking->chi2 = 0.8F;
  bp_algo_params_freq_tracking->zek = 0.75F;
  bp_algo_params_freq_tracking->fs = 8.0F;
  bp_algo_params_freq_tracking->tr_fi.memory = 0.95F;
  bp_algo_params_freq_tracking->tr_fi.b1 = 0.6F;
  bp_algo_params_freq_tracking->tr_fi.b2 = 3.5F;
  bp_algo_params_freq_tracking->init_f = 1.5F;
  bp_algo_params_snr_params->beta = 0.993F;
  *bp_algo_params_max_reset_time = 0.0F;
  *bp_algo_params_r_f_h_h = reset_flag;
  *bp_algo_params_r_f_h_s = reset_flag;
}

static void sum(const float x[192], float y[64])
{
  int iy;
  int ixstart;
  int j;
  int ix;
  float s;
  int k;
  iy = -1;
  ixstart = -1;
  for (j = 0; j < 64; j++) {
    ixstart++;
    ix = ixstart;
    s = x[ixstart];
    for (k = 0; k < 2; k++) {
      ix += 64;
      s += x[ix];
    }

    iy++;
    y[iy] = s;
  }
}

static void trk_3(const float bw[2], float *num, float den[4])
{
  float Gorem2;
  float temp;
  float delta;
  float Gorem4;
  float Gorem6;
  float Gorem8;
  float Gorem9;
  Gorem2 = 0.392699093F * (bw[1] - bw[0]);
  temp = cosf(Gorem2);
  delta = cosf(0.392699093F * (bw[0] + bw[1])) / temp;
  temp /= sinf(Gorem2);
  Gorem2 = temp * temp + 1.0F;
  temp *= 1.41421354F;
  Gorem4 = Gorem2 - temp;
  Gorem6 = 2.0F * (Gorem2 - 2.0F);
  temp += Gorem2;
  *num = 1.0F / temp;
  Gorem8 = -delta * *num;
  Gorem9 = Gorem8 * Gorem6;
  den[0] = Gorem9 + Gorem8 * 2.0F * temp;
  den[1] = (delta * delta * (4.0F * Gorem2 - 4.0F) + Gorem6) * *num;
  den[2] = Gorem9 + Gorem8 * 2.0F * Gorem4;
  den[3] = Gorem4 * *num;
}

static void twister_state_vector(unsigned int mt[625], double seed)
{
  unsigned int r;
  int mti;
  r = (unsigned int)seed;
  mt[0] = r;
  for (mti = 0; mti < 623; mti++) {
    r = (r ^ r >> 30U) * 1812433253U + (1 + mti);
    mt[1 + mti] = r;
  }

  mt[624] = 624U;
}

void mega_bp_step(int ppg, short acc1, short acc2, short acc3, unsigned char
                  sbp_calib, unsigned char dbp_calib, boolean_T use_acc_flag,
                  unsigned char samp_rate, boolean_T reset_flag, unsigned char
                  *sbp_out, unsigned char *dbp_out)
{
  boolean_T bp_algo_params_r_f_h_s;
  boolean_T bp_fft_flag;
  float bp_algo_params_max_reset_time;
  h_struct_T bp_algo_params_snr_params;
  g_struct_T bp_algo_params_freq_tracking;
  float c_bp_algo_params_pre_filter_ag_;
  float d_bp_algo_params_pre_filter_ag_;
  float e_bp_algo_params_pre_filter_ag_;
  float f_bp_algo_params_pre_filter_ag_;
  float bp_peaks;
  float std_orig;
  float bp_algo_params_pre_filter_conf;
  float expl_temp[3];
  float ppg_sig;
  static const double dv0[100] = { 0.080000000000000016, 0.080926128822933152,
    0.083700786097834157, 0.088312799259154917, 0.094743597357676124,
    0.10296728583916509, 0.11295075081260664, 0.12465379238815422,
    0.13802928654789892, 0.15302337489765666, 0.16957568153571306,
    0.18761955616527015, 0.20708234247166774, 0.22788567068371923,
    0.24994577314111965, 0.2731738215972489, 0.29747628489916894,
    0.322755305604566, 0.34890909401913228, 0.37583233806773897,
    0.40341662734899353, 0.43155088966566346, 0.46012183827321207,
    0.48901442804553491, 0.51811231872107855, 0.54729834336401173,
    0.57645498015412278, 0.60546482560571113, 0.63421106730998766,
    0.66257795429741606, 0.690451263126014, 0.7177187578188392,
    0.74427064179865621, 0.76999999999999991, 0.79480322937841075,
    0.81858045608332664, 0.84123593761483106, 0.86267844834490792,
    0.88282164685084719, 0.90158442358168223, 0.91889122745772311,
    0.93467237008808945, 0.94886430638126473, 0.961409890418752,
    0.97225860556151789, 0.98136676786266874, 0.98869770196728735,
    0.99422188879114137, 0.99791708438361892, 0.99976840949626522,
    0.99976840949626522, 0.99791708438361892, 0.99422188879114137,
    0.98869770196728735, 0.98136676786266874, 0.97225860556151789,
    0.961409890418752, 0.94886430638126473, 0.93467237008808945,
    0.91889122745772311, 0.90158442358168223, 0.88282164685084719,
    0.86267844834490792, 0.84123593761483106, 0.81858045608332664,
    0.79480322937841075, 0.76999999999999991, 0.74427064179865621,
    0.7177187578188392, 0.690451263126014, 0.66257795429741606,
    0.63421106730998766, 0.60546482560571113, 0.57645498015412278,
    0.54729834336401173, 0.51811231872107855, 0.48901442804553491,
    0.46012183827321207, 0.43155088966566346, 0.40341662734899353,
    0.37583233806773897, 0.34890909401913228, 0.322755305604566,
    0.29747628489916894, 0.2731738215972489, 0.24994577314111965,
    0.22788567068371923, 0.20708234247166774, 0.18761955616527015,
    0.16957568153571306, 0.15302337489765666, 0.13802928654789892,
    0.12465379238815422, 0.11295075081260664, 0.10296728583916509,
    0.094743597357676124, 0.088312799259154917, 0.083700786097834157,
    0.080926128822933152, 0.080000000000000016 };

  int i;
  static const float fv4[5] = { 0.131106436F, 0.0F, -0.262212873F, 0.0F,
    0.131106436F };

  static const float fv5[5] = { 1.0F, -2.18065786F, 2.02000403F, -1.02551091F,
    0.272214949F };

  static const float fv6[5] = { 0.124169819F, 0.0F, -0.248339638F, 0.0F,
    0.124169819F };

  static const float fv7[5] = { 1.0F, 2.74216914F, 2.79073191F, 1.33114159F,
    0.283100814F };

  static const float fv8[5] = { 0.505001F, 0.0F, -1.01000202F, 0.0F, 0.505001F };

  static const float fv9[5] = { 1.0F, -0.431482434F, -0.685522556F,
    0.0700728372F, 0.272214949F };

  static const double b[5] = { 0.31153877422812393, 0.0, -0.62307754845624785,
    0.0, 0.31153877422812393 };

  static const double a[5] = { 1.0, -0.35269881400811831, -0.03678662101550971,
    -0.04969750658428318, 0.17253125052751833 };

  boolean_T guard1 = false;
  float fv10[5];
  float fv11[5];
  float ppg_noise;
  float snr_fft;
  int c_ppg[4];
  float b_acc1[3];
  float ppg_fft[18];
  float ppg_std;
  float acc_std;
  float ppg_clean;
  unsigned char right_save;
  unsigned char bp_kzd;
  float fv12[99];
  float fv13[99];
  double dv1[5];
  double dv2[5];
  float fv14[5];
  float fv15[5];
  float b_ppg_buff[50];
  float Y_fft[129];
  int itmp;
  int ix;
  int b_right_save;
  int right_buff;
  boolean_T exitg5;
  int left_save;
  boolean_T exitg4;
  float fv16[100];
  float fft_buff_to_use[129];
  unsigned char hr_ind;
  boolean_T exitg3;
  unsigned char max_hr_ind;
  unsigned char i_tmp;
  boolean_T exitg2;
  unsigned char b_left_save;
  boolean_T exitg1;
  double ratio;
  if (!use_acc_flag) {
    acc1 = (short)rt_roundd(b_rand() * 500.0 - 250.0);
    acc2 = (short)rt_roundd(b_rand() * 500.0 - 250.0);
    acc3 = (short)rt_roundd(b_rand() * 500.0 - 250.0);
  }

  set_initial_parameters(reset_flag, &ppg_sig, expl_temp,
    &bp_algo_params_pre_filter_conf, &std_orig, &bp_peaks,
    &f_bp_algo_params_pre_filter_ag_, &e_bp_algo_params_pre_filter_ag_,
    &d_bp_algo_params_pre_filter_ag_, &c_bp_algo_params_pre_filter_ag_,
    &bp_algo_params_freq_tracking, &bp_algo_params_snr_params,
    &bp_algo_params_max_reset_time, &bp_fft_flag, &bp_algo_params_r_f_h_s);
  if ((!bpt_not_empty) || bp_fft_flag || bp_algo_params_r_f_h_s) {
    cnt_tot = 0.0F;
    sbp_calib_p = sbp_calib;
    dbp_calib_p = dbp_calib;
    first_time_bp = true;
    first_bp_val = 0;
    bad_snr_flag_sum = 0.0F;
    bad_snr_flag_count = 0.0F;
    memcpy(&ham_win[0], &dv0[0], 100U * sizeof(double));
    first_time_buff_full = false;
    first_time_buff_full_05 = false;
    reset_flag_bad_snr = reset_flag;
    mega_bp_rst_s = bp_algo_params_r_f_h_s;
    mega_bp_rst_h = bp_fft_flag;
    change_bp_cnt = 0.0F;
    bp_init_reset_flag = false;
    bpt_not_empty = true;
    bp_prev = 0;
    tot_cnt = 0;
    bp_new_prev = 0.0F;
    high_acc_std_cnt = 0.0F;
    for (i = 0; i < 5; i++) {
      b_bpf_s[i] = fv4[i];
      a_bpf_s[i] = fv5[i];
      b_bpf_n[i] = fv6[i];
      a_bpf_n[i] = fv7[i];
      b_bpf_s2[i] = fv4[i];
      a_bpf_s2[i] = fv5[i];
      b_bpf_s3[i] = fv8[i];
      a_bpf_s3[i] = fv9[i];
    }

    reset_flag_peaks = reset_flag;
    for (i = 0; i < 50; i++) {
      ppg_sig_buff[i] = 0.0F;
      ppg_noise_buff[i] = 0.0F;
    }

    buff_ind = 0.0F;
    buff_first_time_flag = false;
    debounce_peaks = 0;
    acc_std_cnt = 0;
    switch_bp_cnt = 0;
    new_init_bp = 0;
    first_time_bp_p = false;
    debounce_he_peaks = 0;
    debounce_he_peaks2 = 0;
    bp_peaks_prev = 0.0F;
    snr_fft_new_prev = 0.0F;
    for (i = 0; i < 100; i++) {
      ppg_buff_clean[i] = 0.0F;
      ppg_buff_orig[i] = 0.0F;
    }

    ppg_buff_ind = 0;
    for (i = 0; i < 5; i++) {
      b_ppg[i] = b[i];
      a_ppg[i] = a[i];
    }

    samp_rate_cnt = 0;
    sbp_out_prev = 0;
    dbp_out_prev = 0;
  }

  if (samp_rate_cnt == 10) {
    samp_rate_cnt = 0;
  }

  guard1 = false;
  if (samp_rate == 100) {
    samp_rate_cnt++;
    if ((samp_rate_cnt != 1) && (samp_rate_cnt != 11)) {
      *sbp_out = sbp_out_prev;
      *dbp_out = dbp_out_prev;
    } else {
      guard1 = true;
    }
  } else {
    guard1 = true;
  }

  if (guard1) {
    for (i = 0; i < 5; i++) {
      fv10[i] = b_bpf_s[i];
      fv11[i] = a_bpf_s[i];
    }

    ppg_sig = bpf_sig(fv10, fv11, (float)ppg, reset_flag);
    for (i = 0; i < 5; i++) {
      fv10[i] = b_bpf_n[i];
      fv11[i] = a_bpf_n[i];
    }

    ppg_noise = bpf_noise(fv10, fv11, (float)ppg, reset_flag);
    buff_ind++;
    if (buff_ind == 51.0F) {
      buff_ind = 1.0F;
      buff_first_time_flag = true;
    }

    ppg_sig_buff[(int)buff_ind - 1] = ppg_sig;
    ppg_noise_buff[(int)buff_ind - 1] = ppg_noise;
    if (buff_first_time_flag) {
      snr_fft = 20.0F * log10f(rdivide(b_std(ppg_sig_buff), b_std(ppg_noise_buff)))
        * 1.375F;
    } else {
      snr_fft = 0.0F;
    }

    c_ppg[0] = ppg;
    c_ppg[1] = acc1;
    c_ppg[2] = acc2;
    c_ppg[3] = acc3;
    b_acc1[0] = acc1;
    b_acc1[1] = acc2;
    b_acc1[2] = acc3;
    bp_algo(c_ppg, (float)ppg, b_acc1, bp_algo_params_pre_filter_conf, std_orig,
            bp_peaks, f_bp_algo_params_pre_filter_ag_,
            e_bp_algo_params_pre_filter_ag_, d_bp_algo_params_pre_filter_ag_,
            c_bp_algo_params_pre_filter_ag_, bp_algo_params_freq_tracking,
            bp_algo_params_snr_params, bp_algo_params_max_reset_time,
            mega_bp_rst_h, mega_bp_rst_s, new_init_bp, bp_init_reset_flag,
            &bp_kzd, &right_save, &ppg_clean, &ppg_sig, &ppg_noise, &acc_std,
            &ppg_std, ppg_fft, &bp_algo_params_r_f_h_s, &bp_fft_flag);
    if (!use_acc_flag) {
      acc_std = 1.0F;
    }

    bp_init_reset_flag = false;
    bp_kzd = (unsigned char)roundf((float)bp_kzd / 0.8F);
    mega_bp_rst_h = false;
    mega_bp_rst_s = false;
    ppg_buff_ind++;
    if (ppg_buff_ind == 101) {
      memcpy(&fv12[0], &ppg_buff_clean[1], 99U * sizeof(float));
      for (i = 0; i < 99; i++) {
        ppg_buff_clean[i] = fv12[i];
        fv13[i] = ppg_buff_orig[1 + i];
      }

      memcpy(&ppg_buff_orig[0], &fv13[0], 99U * sizeof(float));
      ppg_buff_ind = 100;
      first_time_buff_full = true;
    } else {
      if (ppg_buff_ind >= 70) {
        first_time_buff_full_05 = true;
      }
    }

    for (i = 0; i < 5; i++) {
      dv1[i] = b_ppg[i];
      dv2[i] = a_ppg[i];
    }

    ppg_buff_clean[ppg_buff_ind - 1] = bpf_sig4(dv1, dv2, ppg_clean, reset_flag);
    for (i = 0; i < 5; i++) {
      dv1[i] = b_ppg[i];
      dv2[i] = a_ppg[i];
    }

    ppg_buff_orig[ppg_buff_ind - 1] = bpf_sig5(dv1, dv2, (float)ppg, reset_flag);
    for (i = 0; i < 5; i++) {
      fv10[i] = b_bpf_s2[i];
      fv11[i] = a_bpf_s2[i];
      fv14[i] = b_bpf_s3[i];
      fv15[i] = a_bpf_s3[i];
    }

    calc_bp_p(bpf_sig2(fv10, fv11, (float)ppg, reset_flag_peaks), bpf_sig3(fv14,
               fv15, (float)ppg, reset_flag_peaks), reset_flag_peaks, &bp_peaks,
              &ppg_noise, b_ppg_buff);
    bp_fft_flag = false;
    if (acc_std < 10.0F) {
      reset_flag_peaks = false;
      if (bp_peaks > 0.0F) {
        bp_peaks_prev = bp_peaks;
      }

      b_fft4plot(b_ppg_buff, Y_fft);
      bp_algo_params_pre_filter_conf = Y_fft[0];
      itmp = 1;
      for (ix = 0; ix < 128; ix++) {
        if (Y_fft[ix + 1] > bp_algo_params_pre_filter_conf) {
          bp_algo_params_pre_filter_conf = Y_fft[ix + 1];
          itmp = ix + 2;
        }
      }

      b_right_save = 1;
      right_buff = 0;
      exitg5 = false;
      while ((!exitg5) && (right_buff <= 128 - itmp)) {
        i = itmp + right_buff;
        if (Y_fft[i] > Y_fft[i - 1]) {
          b_right_save = i;
          exitg5 = true;
        } else {
          right_buff++;
        }
      }

      left_save = 1;
      right_buff = 0;
      exitg4 = false;
      while ((!exitg4) && (right_buff <= itmp - 2)) {
        i = itmp - right_buff;
        if (Y_fft[i - 2] > Y_fft[i - 1]) {
          left_save = i;
          exitg4 = true;
        } else {
          right_buff++;
        }
      }

      i = b_right_save - left_save;
      for (right_buff = -1; right_buff + 1 <= i; right_buff++) {
        Y_fft[left_save + right_buff] = 0.0F;
      }

      ppg_std = Y_fft[0];
      for (ix = 0; ix < 128; ix++) {
        if (Y_fft[ix + 1] > ppg_std) {
          ppg_std = Y_fft[ix + 1];
        }
      }

      if ((bp_algo_params_pre_filter_conf / ppg_std > 1.75F) &&
          (bp_algo_params_pre_filter_conf > 20.0F) && (0.0390625 * ((double)itmp
            - 1.0) * 60.0 > 35.0) && (left_save > 10) && (b_right_save -
           left_save < 40)) {
        change_bp_cnt++;
        if (change_bp_cnt >= 20.0F) {
          bp_peaks = (float)(0.0390625 * ((double)itmp - 1.0) * 60.0);
          bp_fft_flag = true;
        }
      } else {
        change_bp_cnt = 0.0F;
      }
    } else {
      bp_peaks = 0.0F;
      ppg_noise = 0.0F;
    }

    if (bp_peaks > 0.0F) {
      first_time_bp_p = true;
    }

    tot_cnt++;
    if (tot_cnt > 150) {
      tot_cnt = 150;
    }

    debounce_peaks--;
    if (acc_std < 30000.0F) {
      acc_std_cnt++;
    } else {
      acc_std_cnt = 0;
    }

    if (acc_std_cnt >= 20) {
      acc_std_cnt = 20;
    }

    if ((acc_std < 10.0F) && (!first_time_bp_p) && (bp_prev == 0) &&
        (!bp_algo_params_r_f_h_s)) {
      bp_kzd = 0;
    }

    if ((acc_std_cnt >= 20) || (debounce_peaks > 0)) {
      if (acc_std_cnt >= 20) {
        debounce_peaks = 30;
      }

      ppg_sig = bp_peaks;
      if (fabsf(bp_peaks - (float)bp_kzd) < 5.0F) {
        bp_new_prev = bp_peaks;
      }

      if ((bp_new_prev == 0.0F) || (bp_new_prev == -1.0F)) {
        bp_new_prev = bp_peaks;
      }

      if (bp_peaks > 0.0F) {
        ppg_sig = 0.98F * bp_new_prev + 0.0199999809F * bp_peaks;
      }

      bp_new_prev = ppg_sig;
    } else {
      ppg_sig = -1.0F;
      if (bp_new_prev == 0.0F) {
        bp_new_prev = -1.0F;
      }
    }

    if (switch_bp_cnt > 30) {
      switch_bp_cnt = 31;
    }

    if (acc_std >= 100.0F) {
      high_acc_std_cnt++;
    } else {
      high_acc_std_cnt = 0.0F;
    }

    if (high_acc_std_cnt > 80.0F) {
      high_acc_std_cnt = 80.0F;
    }

    if ((((acc_std < 5.0F) && (fabsf(2.0F - (float)bp_kzd / ppg_sig) < 0.15)) ||
         ((acc_std < 10.0F) && (ppg_noise < 8.0F)) || ((acc_std < 10.0F) &&
          bp_fft_flag)) && (ppg_sig > 0.0F)) {
      debounce_he_peaks++;
      if ((debounce_he_peaks >= 10) || ((acc_std < 10.0F) && (ppg_noise < 3.0F)))
      {
        bp_kzd = (unsigned char)roundf(ppg_sig);
        if (bp_fft_flag) {
          bp_kzd = (unsigned char)roundf(bp_peaks);
        }

        debounce_he_peaks = 10;
      }
    } else {
      debounce_he_peaks = 0;
    }

    new_init_bp = 0;
    if (((ppg_sig > 0.0F) && (bp_kzd == 0)) || ((ppg_sig > 0.0F) && ((snr_fft <
           12.0F) || ((snr_fft < 14.0F) && (fabsf(ppg_sig - (float)bp_kzd) >
            20.0F)))) || (((acc_std < 100.0F) || (high_acc_std_cnt < 80.0F)) &&
                          (snr_fft > 13.0F) && (ppg_sig > 0.0F))) {
      switch_bp_cnt++;
      if ((switch_bp_cnt > 20) || ((switch_bp_cnt > 2) && (bp_kzd == 0))) {
        bp_kzd = (unsigned char)roundf(ppg_sig);
        if (bp_fft_flag) {
          bp_kzd = (unsigned char)roundf(bp_peaks);
        }

        new_init_bp = bp_kzd;
      }
    } else {
      switch_bp_cnt = 0;
    }

    if ((bp_peaks == 0.0F) && (bp_peaks_prev > 0.0F) && (bp_kzd > 0)) {
      debounce_he_peaks2++;
      if (debounce_he_peaks2 <= 10) {
        bp_kzd = bp_prev;
      } else {
        debounce_he_peaks2 = 11;
      }
    } else {
      debounce_he_peaks2 = 0;
    }

    if ((bp_prev == 0) && (bp_kzd > 0) && (bp_peaks > 0.0F)) {
      bp_kzd = (unsigned char)roundf(bp_peaks);
      new_init_bp = (unsigned char)roundf(bp_peaks);
    }

    bp_prev = bp_kzd;
    for (i = 0; i < 100; i++) {
      fv16[i] = (float)ham_win[i] * ppg_buff_clean[i];
    }

    c_fft4plot(fv16, fft_buff_to_use);
    for (i = 0; i < 100; i++) {
      fv16[i] = (float)ham_win[i] * ppg_buff_orig[i];
    }

    c_fft4plot(fv16, Y_fft);
    if ((acc_std < 10.0F) && (bp_peaks > 0.0F)) {
      memcpy(&fft_buff_to_use[0], &Y_fft[0], 129U * sizeof(float));
      std_orig = c_std(ppg_buff_orig);
    } else {
      std_orig = 0.0F;
    }

    for (i = 0; i < 128; i++) {
      fft_buff_to_use[1 + i] = 0.5F * fft_buff_to_use[i] + 0.5F *
        fft_buff_to_use[i + 1];
    }

    memcpy(&Y_fft[0], &fft_buff_to_use[0], 129U * sizeof(float));
    for (i = 0; i < 13; i++) {
      fft_buff_to_use[i] = 0.0F;
    }

    if (acc_std > 5000.0F) {
      memset(&fft_buff_to_use[0], 0, 26U * sizeof(float));
    }

    memset(&fft_buff_to_use[108], 0, 21U * sizeof(float));
    ppg_sig = (float)bp_kzd / 60.0F;
    if ((ppg_sig == 0.0F) && (bp_peaks > 0.0F) && (acc_std < 10.0F)) {
      ppg_sig = bp_peaks / 60.0F;
    }

    hr_ind = 0;
    i = 0;
    exitg3 = false;
    while ((!exitg3) && (i < 129)) {
      if (0.0390625 * (double)i >= ppg_sig) {
        hr_ind = (unsigned char)(1 + i);
        exitg3 = true;
      } else {
        i++;
      }
    }

    i = 20;
    right_buff = 20;
    if (hr_ind <= 20) {
      i = 0;
    }

    if (hr_ind >= 129 - i) {
      right_buff = 0;
    }

    ppg_sig = 0.0F;
    max_hr_ind = hr_ind;
    right_save = (unsigned char)(hr_ind + right_buff);
    for (i_tmp = (unsigned char)(hr_ind - i); i_tmp <= right_save; i_tmp++) {
      if (fft_buff_to_use[i_tmp - 1] > ppg_sig) {
        ppg_sig = fft_buff_to_use[i_tmp - 1];
        max_hr_ind = i_tmp;
      }
    }

    bp_algo_params_pre_filter_conf = fft_buff_to_use[0];
    itmp = 1;
    for (ix = 0; ix < 128; ix++) {
      if (fft_buff_to_use[ix + 1] > bp_algo_params_pre_filter_conf) {
        bp_algo_params_pre_filter_conf = fft_buff_to_use[ix + 1];
        itmp = ix + 2;
      }
    }

    right_save = 1;
    i_tmp = (unsigned char)(max_hr_ind + 1);
    exitg2 = false;
    while ((!exitg2) && (i_tmp < 129)) {
      if ((fft_buff_to_use[i_tmp] > fft_buff_to_use[i_tmp - 1]) || (i_tmp == 128))
      {
        right_save = i_tmp;
        exitg2 = true;
      } else {
        i_tmp++;
      }
    }

    b_left_save = 1;
    if ((max_hr_ind > 1) && (max_hr_ind < 129)) {
      i_tmp = (unsigned char)(max_hr_ind - 1);
      exitg1 = false;
      while ((!exitg1) && (i_tmp > 1)) {
        if (fft_buff_to_use[i_tmp - 2] > fft_buff_to_use[i_tmp - 1]) {
          b_left_save = i_tmp;
          exitg1 = true;
        } else {
          i_tmp--;
        }
      }
    }

    ppg_sig = 0.0F;
    for (i_tmp = b_left_save; i_tmp <= right_save; i_tmp++) {
      ppg_sig += Y_fft[i_tmp - 1];
    }

    ppg_noise = 0.0F;
    for (i_tmp = 1; i_tmp <= b_left_save; i_tmp++) {
      ppg_noise += fft_buff_to_use[i_tmp - 1];
    }

    for (i_tmp = right_save; i_tmp < 130; i_tmp++) {
      ppg_noise += fft_buff_to_use[i_tmp - 1];
    }

    ppg_sig = rdivide(ppg_sig, ppg_noise) * 40.0F;
    ppg_noise = ppg_sig;
    if (rt_roundd((double)(unsigned char)((unsigned int)right_save - b_left_save)
                  / 129.0) > 0.3) {
      ppg_sig = snr_fft_new_prev;
    }

    while (b_left_save <= right_save) {
      fft_buff_to_use[b_left_save - 1] = 0.0F;
      b_left_save++;
    }

    ppg_std = fft_buff_to_use[0];
    i = 1;
    for (ix = 0; ix < 128; ix++) {
      if (fft_buff_to_use[ix + 1] > ppg_std) {
        ppg_std = fft_buff_to_use[ix + 1];
        i = ix + 2;
      }
    }

    if (itmp > i) {
      ratio = (double)itmp / (double)i;
    } else {
      ratio = (double)i / (double)itmp;
    }

    ppg_clean = Y_fft[0];
    right_buff = 1;
    for (ix = 0; ix < 128; ix++) {
      if (Y_fft[ix + 1] > ppg_clean) {
        ppg_clean = Y_fft[ix + 1];
        right_buff = ix + 2;
      }
    }

    ppg_sig = 0.02F * ppg_sig + 0.98F * snr_fft_new_prev;
    if ((first_time_buff_full_05 && (bp_algo_params_pre_filter_conf / ppg_std <
          1.15) && (fabs(ratio - 2.0) > 0.1)) || (first_time_buff_full_05 &&
         (fabs(itmp - i) > 4.0) && (bp_algo_params_pre_filter_conf / ppg_std <
          1.5F) && (ppg_sig < 20.0F) && (acc_std < 10.0F)) || ((ppg_clean /
          bp_algo_params_pre_filter_conf > 1.15) && (right_buff < 129))) {
      bp_fft_flag = true;
      if ((bp_algo_params_pre_filter_conf / ppg_std > 1.1) && (fabs(ratio - 2.0)
           > 1.5) && ((double)itmp / (double)i > 3.0) && (acc_std < 10.0F)) {
        bp_fft_flag = false;
      }

      if ((bp_algo_params_pre_filter_conf / ppg_std > 1.0F) && ((unsigned char)
           (itmp - max_hr_ind) < 3) && (ppg_sig > 5.0F) && (acc_std > 4.0F)) {
        bp_fft_flag = false;
      }

      if (((unsigned char)(right_buff - hr_ind) < 3) && (acc_std > 3000.0F) &&
          (bp_algo_params_pre_filter_conf / ppg_std > 1.05) && (ppg_sig > 5.0F) &&
          first_time_buff_full_05) {
        bp_fft_flag = false;
      }
    } else {
      bp_fft_flag = false;
      if ((std_orig > 1000.0F) && (acc_std < 10.0F) && first_time_buff_full) {
        bp_fft_flag = true;
      }

      if ((acc_std < 10.0F) && first_time_buff_full && (ppg_sig < 10.0F) &&
          (bp_kzd > 190)) {
        bp_fft_flag = true;
      }

      if ((acc_std < 4.0F) && first_time_buff_full && (ppg_sig < 10.0F) &&
          (bp_peaks == 0.0F)) {
        bp_fft_flag = true;
      }

      if ((acc_std < 2.0F) && first_time_buff_full && (ppg_sig < 25.0F) &&
          (ppg_noise < 20.0F) && (bp_peaks == 0.0F) &&
          (bp_algo_params_pre_filter_conf < 0.1)) {
        bp_fft_flag = true;
      }
    }

    if ((acc_std < 10.0F) && first_time_buff_full && (ppg_sig < 10.0F) &&
        (bp_kzd > 190) && (bp_peaks == 0.0F)) {
      bp_fft_flag = true;
    }

    if ((ppg_sig > 15.0F) && first_time_buff_full_05) {
      if ((std_orig > 1000.0F) && (acc_std < 10.0F) && first_time_buff_full) {
        bp_fft_flag = true;
      }
    } else if ((ppg_sig < 4.0F) && first_time_buff_full_05) {
      bp_fft_flag = true;
    } else {
      if ((ppg_sig < 7.0F) && (acc_std < 10.0F) && first_time_buff_full_05) {
        bp_fft_flag = true;
      }
    }

    if ((itmp == i) && first_time_buff_full_05 && (acc_std < 2000.0F)) {
      bp_fft_flag = true;
    }

    if ((itmp == i) && first_time_buff_full_05 && (ppg_sig < 10.0F)) {
      bp_fft_flag = true;
    }

    if ((bp_peaks > 0.0F) && (acc_std < 10.0F) && (!(ppg_sig < 10.0F)) &&
        (!(bp_kzd > 190))) {
      bp_fft_flag = false;
    }

    if ((bp_kzd > 0) || ((bp_peaks > 0.0F) && (acc_std < 10.0F))) {
      debounce_bad_snr_flag(bp_fft_flag, ppg_sig, reset_flag_bad_snr);
      reset_flag_bad_snr = false;
      bad_snr_flag_sum = 0.0F;
      bad_snr_flag_count = 0.0F;
    } else {
      bad_snr_flag_sum += (float)bp_fft_flag;
      bad_snr_flag_count++;
    }

    snr_fft_new_prev = ppg_sig;
    if ((bp_kzd > 0) && first_time_bp) {
      first_bp_val = bp_kzd;
      first_time_bp = false;
    }

    if (first_bp_val > 0) {
      ppg_sig = (float)bp_kzd / (float)first_bp_val * 0.5F;
      right_save = sbp_calib_p;
      ratio = b_rand() * 4.0 - 2.0;
      *sbp_out = (unsigned char)roundf((float)right_save * (ppg_sig + 0.5F) +
        (float)rt_roundd(ratio));
      right_save = dbp_calib_p;
      ratio = b_rand() * 2.0 - 1.0;
      *dbp_out = (unsigned char)roundf((float)right_save * (ppg_sig + 0.5F) +
        (float)rt_roundd(ratio));
      if (*sbp_out > 180) {
        ratio = 180.0 + (b_rand() * 4.0 - 2.0);
        *sbp_out = (unsigned char)rt_roundd(rt_roundd(ratio));
      }

      if (*dbp_out > 110) {
        ratio = 110.0 + (b_rand() * 2.0 - 1.0);
        *dbp_out = (unsigned char)rt_roundd(rt_roundd(ratio));
      }
    } else {
      *sbp_out = 0;
      *dbp_out = 0;
    }

    cnt_tot++;
    if (c_mod(cnt_tot, 10.0F) == 0.0F) {
      sbp_out_prev = *sbp_out;
      dbp_out_prev = *dbp_out;
      cnt_tot = 0.0F;
    } else {
      *sbp_out = sbp_out_prev;
      *dbp_out = dbp_out_prev;
    }
  }
}

void mega_bp_step_initialize(void)
{
  static const e_struct_T r0 = { { 0.96F }, { { 0.8F, 1.5F, 0.8F, 1.2F }, {
        0.95F, 0.99F } } };

  static const float fv0[192] = { -32.0F, 111.0F, 74.0F, 79.0F, -214.0F, -79.0F,
    -117.0F, 221.0F, -243.0F, -110.0F, 210.0F, 174.0F, -207.0F, 140.0F, 97.0F,
    32.0F, 8.0F, 181.0F, 210.0F, -57.0F, 95.0F, -30.0F, -35.0F, -216.0F, -99.0F,
    133.0F, -117.0F, -83.0F, 14.0F, -43.0F, -28.0F, -193.0F, -94.0F, 11.0F,
    207.0F, -52.0F, -141.0F, 59.0F, 193.0F, 61.0F, -215.0F, 203.0F, -127.0F,
    53.0F, 205.0F, -70.0F, -149.0F, 76.0F, -189.0F, -92.0F, 141.0F, 17.0F,
    177.0F, 175.0F, -229.0F, -34.0F, -92.0F, 248.0F, -229.0F, 80.0F, -189.0F,
    167.0F, 116.0F, -32.0F, -36.0F, -113.0F, -119.0F, -54.0F, -101.0F, -75.0F,
    -145.0F, 63.0F, 74.0F, 6.0F, 151.0F, 79.0F, -235.0F, -11.0F, 109.0F, -149.0F,
    110.0F, -89.0F, 129.0F, -146.0F, 24.0F, -93.0F, -28.0F, -56.0F, 4.0F,
    -151.0F, 170.0F, -19.0F, 221.0F, -152.0F, 180.0F, -183.0F, -82.0F, 192.0F,
    193.0F, 191.0F, 67.0F, 170.0F, 158.0F, -100.0F, 190.0F, 203.0F, -117.0F,
    31.0F, 54.0F, 33.0F, 55.0F, 190.0F, 226.0F, 35.0F, 139.0F, 110.0F, 71.0F,
    -33.0F, -215.0F, 184.0F, 61.0F, 121.0F, -243.0F, -207.0F, 114.0F, 52.0F,
    -14.0F, -64.0F, -87.0F, -162.0F, 118.0F, -223.0F, -58.0F, 171.0F, 187.0F,
    226.0F, 144.0F, -149.0F, -108.0F, 7.0F, -108.0F, 71.0F, 46.0F, 155.0F,
    230.0F, -170.0F, -45.0F, -186.0F, 9.0F, 33.0F, -24.0F, 228.0F, -213.0F,
    31.0F, 89.0F, 50.0F, -113.0F, 9.0F, -63.0F, 93.0F, -192.0F, 150.0F, 218.0F,
    -177.0F, 13.0F, 65.0F, 143.0F, 119.0F, -173.0F, -203.0F, 160.0F, -126.0F,
    105.0F, 30.0F, -22.0F, 197.0F, 206.0F, -181.0F, -138.0F, 185.0F, -50.0F,
    200.0F, 118.0F, -182.0F, -75.0F, 50.0F, 144.0F, -228.0F, 175.0F, 74.0F,
    -96.0F, -233.0F };

  int i;
  static const float fv1[64] = { 383458.0F, 386065.0F, 388627.0F, 391015.0F,
    393312.0F, 385572.0F, 375565.0F, 371839.0F, 372538.0F, 375024.0F, 377879.0F,
    380633.0F, 383491.0F, 386125.0F, 388220.0F, 380037.0F, 370665.0F, 368274.0F,
    369707.0F, 372567.0F, 375640.0F, 378640.0F, 381720.0F, 384595.0F, 386759.0F,
    378688.0F, 371121.0F, 370635.0F, 372247.0F, 375041.0F, 378412.0F, 381432.0F,
    384484.0F, 387457.0F, 388502.0F, 380354.0F, 375491.0F, 376521.0F, 378427.0F,
    381426.0F, 384474.0F, 387495.0F, 390448.0F, 393358.0F, 392769.0F, 385739.0F,
    382806.0F, 384022.0F, 385722.0F, 388447.0F, 390998.0F, 393688.0F, 396278.0F,
    397796.0F, 392478.0F, 390769.0F, 391968.0F, 393440.0F, 395745.0F, 398109.0F,
    400399.0F, 402740.0F, 404373.0F, 398208.0F };

  static const float fv2[64] = { 4.74494505F, 6.29102612F, 6.67417049F,
    6.26702213F, 5.14625263F, -4.749084F, -8.80174637F, -6.02120495F,
    -2.45791912F, 1.50060046F, 4.80697298F, 6.13825321F, 6.42494059F,
    6.07469559F, 3.89445949F, -6.71522427F, -8.50693417F, -4.99084902F,
    -1.55021417F, 2.36583233F, 5.01614189F, 6.18037462F, 6.30082035F, 5.9019F,
    1.67474222F, -8.06627846F, -8.23006344F, -4.70754242F, -1.51074219F,
    2.29448223F, 4.66099787F, 5.92208672F, 6.09726715F, 4.64027929F,
    -5.70083237F, -6.91904449F, -3.93336797F, -1.1508112F, 2.47024345F,
    4.94981718F, 5.96391678F, 6.17130852F, 4.84306526F, -8.71037483F, 3.9932847F,
    6.03458405F, 6.62759209F, 6.3255372F, 5.67071104F, -5.08455658F,
    -10.1730413F, -8.01895905F, -4.04198265F, 0.461045F, 4.14910269F,
    6.06306076F, 6.6845274F, 6.37963486F, 5.43713284F, -4.16843224F,
    -9.16492748F, -6.95494747F, -2.94192934F, 1.45320106F };

  static const float fv3[64] = { 0.0223676302F, -0.323465466F, -0.0075624641F,
    0.479181498F, -0.751758397F, -0.593541503F, -0.16424486F, 0.171001345F,
    0.116797052F, 0.239969477F, 0.986067F, 0.671031177F, 0.748671532F,
    0.136853173F, -0.756204069F, -0.825549662F, -0.49466905F, 0.0890562311F,
    0.598168135F, 0.419411302F, 0.259480983F, 0.0808069333F, 0.282105237F,
    0.789910674F, -1.0848155F, -0.196241945F, -0.0204063412F, 0.181645185F,
    0.961344302F, 0.262327194F, -0.0636718F, -0.0720060244F, -0.0926562548F,
    -0.119589932F, -1.1568383F, 0.14243415F, 0.263295114F, 0.483757019F,
    0.589156568F, 0.191396207F, 0.216822878F, 0.425280333F, 0.262944221F,
    -0.786672056F, -0.0334031694F, -0.113369666F, 0.335053355F, 0.235279307F,
    -0.0627967268F, -1.09498119F, -0.200118154F, 0.0683698878F, -0.296002537F,
    -0.00770797534F, 0.515549302F, 0.676194847F, 0.626445353F, -0.260594875F,
    -0.794889867F, -0.198823929F, 0.45632869F, 0.447551042F, 0.549562573F,
    -0.250752926F };

  mega_bp_params = r0;
  memcpy(&vect_act_makor[0], &fv0[0], 192U * sizeof(float));
  for (i = 0; i < 64; i++) {
    vect_pleth_makor[i] = fv1[i];
    vect_ted_men[i] = fv2[i];
    vect_ted_act[i] = fv3[i];
  }

  harm_cnt_ok_not_empty = false;
  noise_flag_not_empty = false;
  kl_not_empty = false;
  gap_prev1_not_empty = false;
  inner_reset_not_empty = false;
  fft_index_not_empty = false;
  mem_not_empty = false;
  shev_up_not_empty = false;
  rftd_not_empty = false;
  ppg_f_v_not_empty = false;
  noc_not_empty = false;
  pop1_not_empty = false;
  SNR = b_SNR;
  acc_run_flag = b_acc_run_flag;
  t_r_f_not_empty = false;
  state_not_empty = false;
  cnt_1_not_empty = false;
  ppg_buff_not_empty = false;
  f_z_not_empty = false;
  e_z_not_empty = false;
  d_z_not_empty = false;
  c_z_not_empty = false;
  b_z_not_empty = false;
  z_not_empty = false;
  bpt_not_empty = false;
  eml_rand_init();
  eml_rand_mcg16807_stateful_init();
  eml_rand_shr3cong_stateful_init();
}

void mega_bp_step_terminate(void)
{
}
