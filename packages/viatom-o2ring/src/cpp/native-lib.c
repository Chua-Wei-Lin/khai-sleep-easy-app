#include <jni.h>
#include "mega_bp_step.h"

/* TODO: confirm these three against the Viatom/Lepu documentation */
#define PPG_SAMPLE_RATE_HZ 125
#define SBP_CALIB 120
#define DBP_CALIB 80
static boolean_T g_reset = 1;
static int g_initialized = 0;

JNIEXPORT void JNICALL
Java_expo_modules_viatom_MegaBpNative_initNative(JNIEnv *env, jobject thiz) {
mega_bp_step_initialize();
g_initialized = 1;
g_reset = 1;
}

JNIEXPORT jdoubleArray JNICALL
Java_expo_modules_viatom_MegaBpNative_stepNative(JNIEnv *env, jobject thiz, jint ppg_val) {
    unsigned char sbp = 0, dbp = 0;

    if (!g_initialized) {
        mega_bp_step_initialize();
        g_initialized = 1;
        g_reset = 1;
    }

    mega_bp_step((int)ppg_val, 0, 0, 0,
                 (unsigned char)SBP_CALIB, (unsigned char)DBP_CALIB,
                 0 /* use_acc_flag: no accelerometer data */,
                 (unsigned char)PPG_SAMPLE_RATE_HZ,
                 g_reset, &sbp, &dbp);
    g_reset = 0;

    jdoubleArray result = (*env)->NewDoubleArray(env, 2);
    if (result == NULL) return NULL;
    jdouble fill[2] = { (jdouble)sbp, (jdouble)dbp };
    (*env)->SetDoubleArrayRegion(env, result, 0, 2, fill);
    return result;
}

JNIEXPORT void JNICALL
Java_expo_modules_viatom_MegaBpNative_terminateNative(JNIEnv *env, jobject thiz) {
mega_bp_step_terminate();
g_initialized = 0;
g_reset = 1;
}