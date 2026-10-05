cmake_minimum_required(VERSION 3.18.1)
project("viatom_o2ring_native")

add_library(
        megabp
        SHARED
        native-lib.c
        mega_bp_step.c
)

find_library(log-lib log)

target_link_libraries(
        megabp
        ${log-lib}
)