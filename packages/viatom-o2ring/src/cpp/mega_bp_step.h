#ifndef __MEGA_BP_STEP_H__
#define __MEGA_BP_STEP_H__
#include <math.h>
#include <stddef.h>
#include <stdlib.h>
#include <string.h>
#include "rtwtypes.h"
#include "mega_bp_step_types.h"

extern void mega_bp_step(int ppg, short acc1, short acc2, short acc3, unsigned
  char sbp_calib, unsigned char dbp_calib, boolean_T use_acc_flag, unsigned char
  samp_rate, boolean_T reset_flag, unsigned char *sbp_out, unsigned char
  *dbp_out);
extern void mega_bp_step_initialize(void);
extern void mega_bp_step_terminate(void);

#endif
